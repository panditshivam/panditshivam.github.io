#!/usr/bin/env python3
"""Bounded HF provider test; no automatic retries or provider fallback.

Requires explicit authorization for the account/route before execution.
Reads the existing HF token from its standard environment/cache location.
Only a fixed synthetic lookup is executable; model-generated code never runs.
"""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

MODEL = 'deepseek-ai/DeepSeek-V4.1-Flash-1017:novita'
PROMPT = 'Use lookup for Pune and Delhi. Then return JSON mapping each city to its returned score. These are synthetic test scores, not real city facts.'
SCORES = {'Pune': 17, 'Delhi': 29}
TOOLS = [{'type': 'function', 'function': {
    'name': 'lookup', 'description': 'Read a synthetic test score by city.',
    'parameters': {'type': 'object', 'properties': {'city': {'type': 'string', 'enum': list(SCORES)}},
                   'required': ['city'], 'additionalProperties': False}}}]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output/'protocol.json').write_text(json.dumps({
        'frozen_at': dt.datetime.now(dt.timezone.utc).isoformat(),
        'model': MODEL, 'prompt': PROMPT, 'expected': SCORES,
        'max_requests': 2, 'max_tokens_per_request': 512,
        'scope': 'Hosted tool roundtrip; does not validate provider prompt serialization or checkpoint identity beyond returned metadata.'}, indent=2)+'\n')
    hf_home = Path(os.environ.get('HF_HOME', Path(os.environ.get('XDG_CACHE_HOME', Path.home()/'.cache'))/'huggingface'))
    token = os.environ.get('HF_TOKEN') or os.environ.get('HUGGING_FACE_HUB_TOKEN')
    if not token:
        token = (hf_home/'token').read_text().strip()
    messages = [{'role': 'user', 'content': PROMPT}]
    for number in (1, 2):
        payload = dict(model=MODEL, messages=messages, tools=TOOLS,
                       tool_choice='required' if number == 1 else 'none', max_tokens=512, temperature=0)
        (args.output/f'request-{number}.json').write_text(json.dumps(payload,indent=2)+'\n')
        request = urllib.request.Request('https://router.huggingface.co/v1/chat/completions',
            data=json.dumps(payload).encode(),
            headers={'Authorization': 'Bearer '+token, 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                status, raw = response.status, response.read().decode()
        except urllib.error.HTTPError as error:
            status, raw = error.code, error.read().decode()
        (args.output/f'response-{number}.json').write_text(raw+'\n')
        (args.output/f'status-{number}.json').write_text(json.dumps({'http_status':status,'at':dt.datetime.now(dt.timezone.utc).isoformat()})+'\n')
        print('Request',number,'HTTP',status,flush=True)
        if status != 200:
            print('Stopped without retry or fallback. See saved response.')
            raise SystemExit(1)
        data = json.loads(raw); choice = data['choices'][0]
        assert choice['finish_reason'] != 'length', 'Truncated output is not a completed test'
        message = choice['message']
        if number == 1:
            calls=message.get('tool_calls',[])
            assert len(calls)==2, 'Expected exactly two lookup calls'
            cities=[];results=[]
            for call in calls:
                assert call['type']=='function' and call['function']['name']=='lookup'
                value=json.loads(call['function']['arguments'])
                assert set(value)=={'city'} and value['city'] in SCORES
                cities.append(value['city'])
                results.append({'role':'tool','tool_call_id':call['id'],
                    'content':json.dumps({'city':value['city'],'score':SCORES[value['city']]})})
            assert sorted(cities)==sorted(SCORES) and len({c['id'] for c in calls})==2
            messages.append(message)
            messages.extend(reversed(results))
        else:
            content=message['content'].strip()
            if content.startswith('```'):
                content='\n'.join(content.splitlines()[1:-1])
            assert json.loads(content)==SCORES, 'Final answer did not match the independent lookup'
            (args.output/'checks.json').write_text(json.dumps({'passed':True,'requests':2,'synthetic_lookup_calls':2,'final_expected':SCORES},indent=2)+'\n')
            print('Hosted two-call synthetic lookup and checked final answer passed.')


if __name__=='__main__':
    main()
