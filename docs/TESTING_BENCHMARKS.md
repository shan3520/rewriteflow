# Testing

| Part | Command | What's covered |
|------|---------|----------------|
| Backend | `cd backend && npm test` | node:test: prompts (incl. shared fixture), validation, rate limit, quota, Groq retries, every route with fake Groq/Supabase, per-user scoping |
| Frontend | `cd frontend && npm test` | vitest + Testing Library: diff, meaning check and readability (shared fixtures), exporters (.docx, .zip), style selection, step chain editing, command palette, modal focus, history grouping, batch dashboard, streaming runner hook |
| CLI | `python -m unittest discover tests` | shared fixtures, prompt parity, workflow parsing, Groq client retries (fake HTTP), runner, batch, plugins, CLI end to end |
| Lint | `cd frontend && npm run lint` | ESLint incl. React hooks rules |

None of the suites touch the network.

## Shared fixtures

`shared/fixtures/meaning_check.json`, `readability.json` and `prompts.json` hold expected outputs. The JS and Python implementations are both tested against them, so a change on one side that isn't mirrored on the other fails CI. If you change an algorithm on purpose, update both implementations, then regenerate the fixture from the JS side.
