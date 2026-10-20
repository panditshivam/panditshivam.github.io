#!/usr/bin/env python3
"""Check a saved hosted transcript and replay its second request through the encoder."""
import argparse
import importlib.util
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('run', type=Path)
    parser.add_argument('--encoder', type=Path, required=True)
    args = parser.parse_args()
    read = lambda name: json.loads((args.run/name).read_text())
    protocol = read('protocol.json')
    expected = protocol['expected']
    first = read('response-1.json')['choices'][0]
    final = read('response-2.json')['choices'][0]
    assert first['finish_reason'] == 'tool_calls'
    assert final['finish_reason'] == 'stop'
    content = final['message']['content'].strip()
    if content.startswith('```'):
        content = '\n'.join(content.splitlines()[1:-1])
    assert json.loads(content) == expected
    messages = read('request-2.json')['messages']
    calls = messages[1]['tool_calls']
    results = messages[2:]
    assert len(calls) == len(results) == len(expected) == 2
    assert [r['tool_call_id'] for r in results] == [c['id'] for c in reversed(calls)]
    by_id = {r['tool_call_id']: json.loads(r['content']) for r in results}
    for call in calls:
        assert call['function']['name'] == 'lookup'
        city = json.loads(call['function']['arguments'])['city']
        assert by_id[call['id']] == {'city': city, 'score': expected[city]}
    spec = importlib.util.spec_from_file_location('encoding', args.encoder)
    encoder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(encoder)
    prompt = encoder.encode_messages(messages, thinking_mode='chat')
    markers = [json.dumps(by_id[c['id']]) for c in calls]
    assert prompt.index(markers[0]) < prompt.index(markers[1])
    (args.run/'actual-transcript-encoded.txt').write_text(prompt+'\n')
    checks = {'hosted_roundtrip_correct': True, 'actual_api_transcript_encoder_order_checked': True,
              'supplied_result_order': [by_id[r['tool_call_id']]['city'] for r in results],
              'encoded_result_order': [by_id[c['id']]['city'] for c in calls],
              'scope': 'Local replay of actual API messages. Does not prove provider used this local encoder or immutable weight revision.'}
    (args.run/'transcript-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
    print(json.dumps(checks,indent=2))


if __name__ == '__main__':
    main()
