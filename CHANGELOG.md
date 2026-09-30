# Changelog

## [2.0.0] - 2026-09-30

The placeholder code from 1.2.0 is replaced with working features.

### Added
- **Workflows**: ordered steps from a shared step library (grammar, clarity, simplify, concise, expand, formal, casual, active voice, translate, summarize, markdown) plus a custom instruction. Saved per user (new `workflows` table), with five starters in `presets/`. The Workflows page has an editor with a reorderable step chain.
- **Length and tone adjustments** on every mode and workflow.
- **Review tools**: Clean/Changes word diff, readability before/after, and a meaning check that flags numbers, names, links, emails, citations and quotes a rewrite dropped or introduced.
- **Batch** page for .txt/.md files with per-file progress and meaning check, rate-limit retry, and .zip download.
- **Export** to .txt, .md and .docx.
- **Command palette** (Ctrl/Cmd+K), Ctrl/Cmd+Enter to rewrite, and a Stop button.
- **History** grouped by day, with a detail view (split diff, readability, meaning check) and restore to editor.
- **API**: `GET /api/steps`, `GET /api/workflows/starters`, workflow CRUD, and `/api/rewrite` accepting `workflowId`, inline `steps` and `options`.
- **Per-user rate limit** (`RATE_LIMIT_PER_MINUTE`) and optional daily character quota (`DAILY_CHAR_LIMIT`).
- **Python CLI** (`python -m engine`): run modes and workflows on files, folders or stdin; `analyze`, `validate`, `steps`, `presets`; JSON reports; plugins.
- **Shared fixtures** keep the JS and Python prompt builders, meaning check and readability identical.
- Real test suites: backend (node:test), frontend (vitest), CLI (unittest).

### Changed
- The backend is split into routes, middleware, controllers and a repository, with `createApp()` for dependency injection.
- Mode prompts describe the style instead of "removing plagiarism", and every prompt tells the model to keep all facts, numbers, names, quotations and citations.
- `render.yaml` builds from the repo root; the Docker image contains only the backend.

### Removed
- Unwired Express stubs (webhooks, Redis cache, event dispatcher, keyword filter), unrouted frontend stubs, the exec()-based "sandbox", word-swap "nodes", and placeholder tests and docs.

### Migration
- Existing Supabase databases: run `db/migrations/002_workflows.sql`.

## [1.2.0] - 2026-08-05
- Placeholder release; see 2.0.0.
