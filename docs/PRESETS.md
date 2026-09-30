# Workflows and starter presets

A workflow is an ordered list of steps from [`shared/steps.json`](../shared/steps.json) plus an optional free-text instruction. The web app stores them per user in Supabase, and the CLI reads them from YAML or JSON files. The files in [`presets/`](../presets) are the starters offered in both.

```yaml
name: Email Polish
description: Turns a rough draft into a short, professional email.
steps:
  - grammar
  - concise
  - formal
  # steps with parameters:
  # - id: translate
  #   params: { lang: French }
custom_instruction: Keep it courteous and make any request or deadline explicit.
post:            # CLI only: local post-processing after the rewrite
  - tidy_markdown
```

Rules: a name is required; at most 10 steps; at least one step or a `custom_instruction` (≤ 1,000 characters); only the params a step declares.

All steps are composed into a single instruction ("Apply the following edits to the text, in order: 1… 2…"), so a workflow costs one model call per paragraph however many steps it has.

## Starters

| File | Name | Steps |
|------|------|-------|
| `academic_paper.yaml` | Academic Paper Polish | grammar → clarity → formal |
| `blog_post_rewrite.yaml` | Blog Post Rewrite | grammar → concise → casual |
| `email_polish.yaml` | Email Polish | grammar → concise → formal |
| `seo_article_optimizer.yaml` | Web Article Readability | clarity → simplify → active_voice |
| `technical_doc_generator.yaml` | Technical Docs Polish | grammar → clarity → active_voice → markdown |

Adding a YAML file here makes it a starter everywhere (web app ids are `starter:<file name>`). Run `python -m engine validate presets/*.yaml` to check it.
