# Command-line guide

The `engine/` package is a standalone CLI that runs the web app's modes and workflows on local files. It calls Groq directly and needs no backend or database.

```bash
pip install -r requirements.txt       # PyYAML; the Groq client uses only the standard library
export GROQ_API_KEY=gsk_...
```

## Commands

```bash
python -m engine steps                      # modes, steps (with params) and options
python -m engine presets                    # starter workflows in presets/
python -m engine validate my-workflow.yaml  # check workflow files

# Rewrite files or whole folders into ./rewritten (same relative paths)
python -m engine run --workflow email_polish drafts/ --out polished/
python -m engine run --mode simplified --length shorter notes.txt report.md
python -m engine run --steps grammar,translate --param translate.lang=German letter.txt
python -m engine run --instruction "Only fix typos." essay.md

# stdin → stdout
pbpaste | python -m engine run --workflow blog_post_rewrite - | pbcopy

# Compare any two texts: readability before/after and the meaning check
python -m engine analyze original.md rewritten.md [--json]
```

### `run` options

| Option | |
|--------|--|
| `--mode`, `--workflow`, `--steps` (+ `--param STEP.NAME=VALUE`), `--instruction` | Instruction source. Pick one; `--instruction` can combine with `--steps`. Default `--mode standard`. |
| `--length shorter\|same\|longer`, `--formality casual\|neutral\|formal` | Same adjustments as the web app |
| `--out DIR` | Output folder (default `rewritten`). Refuses to overwrite an input file. |
| `--workers N` | Files in parallel (default 1; Groq's free tier rate-limits quickly) |
| `--post NODE` | Local post-processing: `tidy_markdown`, `tidy_whitespace`, or a plugin |
| `--plugin FILE.py:Class` | Load your own post-processing node ([PLUGIN_GUIDE.md](PLUGIN_GUIDE.md)) |
| `--report FILE.json` | Per-file timings, token estimates, SHA-256 hashes, readability and meaning check |
| `--dry-run` | Print the system prompt and exit, without calling the API |
| `--quiet` | No progress output |

Exit codes: `0` success, `1` a file or API call failed, `2` usage error.

Each file's progress line ends with its meaning-check result, for example `1 detail to check`. Run `analyze` on that pair to see which numbers, names or citations changed.

## How a run works

```
cli.py ─► parser.py (load/validate workflow) ─► prompts/builder.py (system prompt)
      ─► batch.py (collect files, thread pool)
            └─► runner.py: LLMRewriteNode (one Groq call per paragraph, llm.py retries 429)
                           → post nodes (registry.py / plugins)
                           → metrics/report.py (readability, content overlap, meaning check)
      ─► telemetry.py (JSON report)
```

| Module | |
|--------|--|
| `llm.py` | Groq chat-completions over HTTP; honors `Retry-After`; `GROQ_MODEL` and `GROQ_BASE_URL` work the same as for the backend |
| `nodes/rewrite.py` | Per-paragraph rewrite (paragraphs are split on blank lines, as in the backend) |
| `nodes/hallucination.py` | Meaning check (Python port of the frontend's) |
| `nodes/formatting.py`, `nodes/cleanup.py` | Deterministic Markdown and whitespace tidy-ups |
| `metrics/` | Readability, TF-IDF content overlap, edit distance, combined report |

Tests: `python -m unittest discover tests` (no network; a fake LLM is injected).
