# DeepSeek Flash 1017: hosted tools and local prompt inspection

A small completed demo, not a model benchmark. The hosted route is
`deepseek-ai/DeepSeek-V4.1-Flash-1017:novita` on Hugging Face Inference Providers.
It requests two synthetic score lookups, supplies their results in reverse order,
and checks the final answer. The local checker replays those real API messages
through the official reference encoder. This does not establish what encoder
or immutable weights the hosted provider used.

Python 3 standard library only; tested with Python 3.14.7. Hosted requests require
a Hugging Face token with Inference Providers permission and available credits.
Set `HF_TOKEN` through your normal secret management, or use the existing token
cached by `hf auth login`. Never paste a token into a source file.

Download the pinned encoder and its MIT licence into this folder:

```sh
curl --fail --location --output encoding.py https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/resolve/1bae0e1088993b9b82de08f59de5be5a34e42170/encoding/encoding.py
curl --fail --location --output UPSTREAM-LICENSE https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/resolve/1bae0e1088993b9b82de08f59de5be5a34e42170/LICENSE
```

`encoding.py` SHA256:
`13231c592e958fb39e2af6001dae69d90e7a36b265702b9b390236fb387599e2`.
Do not run a different encoder revision and call it the same check.

```sh
python3 hf_smoke.py --output live-run
python3 check_hosted.py live-run --encoder encoding.py
```

The first command makes at most two metered requests, each capped at 512 output
tokens, with no retries and no provider fallback. It refuses to reuse an existing
output directory. Stop on any error; a truncated or incorrect response does not
count as success. It saves requests, responses and status codes, without the
Authorization header. Synthetic expected scores are Pune 17 and Delhi 29; these
are test fixtures, not facts about the cities. Only this fixed lookup executes;
no model-generated code runs.

The second command is local and makes no inference requests. A successful run
checks the final mapping, matching call IDs and the local encoded result order.
Keep any outputs private until you have reviewed them. This demo does not cover
token IDs, images, arbitrary tools, production hardening or model quality.

Scripts are MIT licensed. The separately downloaded upstream encoder retains
DeepSeek's MIT licence in UPSTREAM-LICENSE.
