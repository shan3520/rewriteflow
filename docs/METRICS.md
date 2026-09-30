# Review metrics

Computed locally after every rewrite: in the browser (`frontend/src/lib/`) and in the CLI (`engine/`). Both implementations are tested against the same expected results in [`shared/fixtures/`](../shared/fixtures).

## Meaning check

Extracts the concrete details a rewrite must keep, then reports which are **missing** from the rewrite and which are **new** in it:

| Type | Examples | Matching |
|------|----------|----------|
| Number | `12%`, `4.5`, `2023`, `1,000` (= `1000`) | exact number, so `5` doesn't match inside `50` |
| Name | `Jane Doe`, `Acme Corp`, `COVID-19` | capitalized words not at a sentence start |
| Link / Email | `https://…`, `ops@example.com` | exact |
| Citation | `(Smith et al., 2020)`, `[3]` | exact, whitespace-insensitive |
| Quote | `"ship it today"` | exact, curly and straight quotes treated alike |

It's a heuristic and errs toward flagging. "5" rewritten as "five" is reported, as is a name moved to the start of a sentence. It's meant as a checklist of what to look at, not a verdict.

## Readability

| Metric | Formula |
|--------|---------|
| Flesch reading ease | 206.835 − 1.015 × words/sentence − 84.6 × syllables/word (higher is easier) |
| Flesch–Kincaid grade | 0.39 × words/sentence + 11.8 × syllables/word − 15.59 |
| Avg sentence length | words ÷ sentences |
| Reading time | words ÷ 238 wpm |

Syllables use the usual vowel-group heuristic, so expect ±1 on some words ("beautiful" counts as 4). The CLI also reports the Gunning fog and Coleman–Liau indexes.

## Diff and change share (web)

Word-level diff per paragraph pair (`diff` package, `diffWords`). "Words changed" is the share of the original's words that were removed or replaced.

## Content overlap (CLI)

TF-IDF cosine similarity of the two texts' vocabularies (0–1). It measures shared wording, not meaning.
