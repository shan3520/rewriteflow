# How prompts are built

Each paragraph is sent to the model with one system prompt, assembled from [`shared/steps.json`](../shared/steps.json):

```
<mode prompt>                                   ─┐
  or                                             │ the instruction source
You are a careful editor.                        │
Apply the following edits to the text, in order: │
1. <step instruction, {params} filled in>        │
2. …                                             │
Additional instructions from the user:           │
<custom_instruction>                            ─┘

<length option line, if not "same">
<formality option line, if not "neutral">

<preserveRule>   keep every fact, number, name, quotation and citation; add none
<outputRule>     output only the resulting text
```

Implementations: `backend/src/lib/prompts.js` and `engine/prompts/builder.py`. Both are tested against `shared/fixtures/prompts.json`, so the web app and the CLI always send identical prompts. To change wording, edit `steps.json`, regenerate the fixture from the backend, and run both test suites. See `python -m engine run … --dry-run` to print the exact prompt for any combination.
