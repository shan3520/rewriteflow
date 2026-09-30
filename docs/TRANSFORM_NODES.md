# Steps and nodes reference

## Steps (`shared/steps.json`)

Used in workflows, in the web editor and by the CLI (`--steps`). Each step is one instruction to the model.

| id | Label | Instruction summary | Params |
|----|-------|---------------------|--------|
| `grammar` | Fix grammar | Spelling, grammar, punctuation only | |
| `clarity` | Improve clarity | Untangle sentences, main point first | |
| `simplify` | Simplify | Plain English, short sentences | |
| `concise` | Make concise | Cut filler and redundancy | |
| `expand` | Expand | Add connecting explanation, no invented facts | |
| `formal` | Formal tone | Professional register, no contractions | |
| `casual` | Casual tone | Conversational register | |
| `active_voice` | Active voice | Passive → active where the actor is known | |
| `translate` | Translate | Translate, keeping names and numbers | `lang` (default Spanish) |
| `summarize` | Summarize | Key points in at most N sentences | `sentences` (default 2) |
| `markdown` | Markdown structure | Lists, code spans, light emphasis | |

Every prompt, whether a mode or a workflow, ends with two shared rules: preserve every fact, number, name, quotation and citation and add none; output only the resulting text.

## Modes

`standard`, `academic` (UI: Professional), `aggressive` (Extensive), `simplified` (Clarified), `creative` (Expressive). Each is a single prompt in `steps.json`.

## Local nodes (CLI `post:` / `--post`)

| Name | Class | Does |
|------|-------|------|
| `tidy_markdown` | `MarkdownFormattingNode` | `#Title` → `# Title`, `*`/`+` bullets → `-`, trailing spaces, extra blank lines; skips code fences |
| `tidy_whitespace` | `TextCleanupNode` | Collapses spaces, removes space before punctuation and doubled words, keeps paragraphs |

Other runner nodes: `LLMRewriteNode` (the model call) and `HallucinationDetectorNode` (records the meaning check). Custom nodes: [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md).
