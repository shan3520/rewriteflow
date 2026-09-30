# Frontend

React 19 + Vite 5 + Tailwind 3. Routes (all but auth require a session):

| Route | Page | What it does |
|-------|------|--------------|
| `/` | `AppPage` | Paste text, pick a mode or workflow, adjust length/tone, rewrite; then review the diff, readability and meaning check; copy or export |
| `/workflows` | `WorkflowsPage` | Starter and saved workflows; create, edit, duplicate, delete |
| `/batch` | `BatchPage` | Rewrite many .txt/.md files one after another; download each or all as .zip |
| `/history` | `HistoryPage` | Past rewrites grouped by day; search, filter, view details, restore to editor |
| `/login`, `/register` | auth | Supabase email/password |

## State

- `context/AuthContext` holds the Supabase session.
- `context/PipelineContext` holds the step library, starters and the user's saved workflows, with `save`/`remove`.
- `hooks/usePipelineRunner` runs one streaming rewrite at a time (progress, output, cancel), shared by the workspace and batch.
- `lib/selection.js`: the style picker's value is one string: `mode:<id>` or `workflow:<id>`.

## Local analysis (`src/lib/`)

| File | Purpose |
|------|---------|
| `diff.js` | Word diff per paragraph pair, plus share of words changed |
| `meaningCheck.js` | Numbers, names, links, emails, citations and quotes missing from or added to the rewrite |
| `readability.js` | Flesch reading ease, Flesch–Kincaid grade, sentence length, reading time |
| `exporters.js` | .txt / .md / .docx (lazy-loaded `docx`) and .zip (lazy-loaded `jszip`) |

## Keyboard

- **Ctrl/Cmd + Enter**: rewrite
- **Ctrl/Cmd + K**: command palette (switch style, adjust length/tone, copy, export, navigate, toggle theme)
- The style picker is a full listbox: arrows, Home/End, Escape.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase project (anon key) |
| `VITE_API_BASE_URL` | Backend URL (default `http://localhost:3000`) |

## Scripts

`npm run dev` · `npm run build` · `npm run lint` · `npm test` (vitest + Testing Library)

Components are listed in [FRONTEND_COMPONENTS.md](FRONTEND_COMPONENTS.md), and visual rules are in [DESIGN.md](DESIGN.md).
