# RewriteFlow — AI-Powered Text Refinement

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Hono-339933?logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?logo=groq&logoColor=white)

Rewrite text paragraph by paragraph with **Llama 3.3 70B** via Groq, using built-in styles or your own saved **workflows**, and then **check what changed** before you use it: word diff, readability before/after, and a meaning check that flags any number, name, link, citation or quote the rewrite dropped or invented.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · Vite 5 · Tailwind CSS 3 · Framer Motion |
| Backend | Node.js · Hono |
| AI | Groq (`llama-3.3-70b-versatile`) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| CLI | Python 3.11 (`python -m engine`) |
| Hosting | Vercel (frontend) · Render (backend) |

## Features

- ✍️ **5 styles**: Standard, Professional, Extensive, Clarified, Expressive, each with **length** (shorter/same/longer) and **tone** (casual/neutral/formal) adjustments
- 🧩 **Workflows**: chain steps like *fix grammar → make concise → formal → translate (French)* plus your own instruction, save them, reuse them. Five starters included, and each workflow costs one AI call per paragraph however many steps it has.
- 🔍 **Review before you use it**: Clean/Changes toggle with a word-level diff, readability (grade level, reading ease, sentence length, reading time), and a **meaning check** of numbers, names, links, citations and quotes
- 📦 **Batch**: drop in a set of .txt/.md files, run them all through one style or workflow, download a .zip
- 📄 **Export**: .txt, .md or Word (.docx), optionally with the original
- ⌨️ **Keyboard first**: Ctrl/Cmd+Enter to rewrite, Ctrl/Cmd+K command palette
- 📜 **History**: grouped by day, searchable, with a detail view and restore to editor
- 🖥️ **CLI**: the same styles and workflows on local files and folders, stdin/stdout, JSON reports, plugins
- ⚡ **Streaming**: paragraphs appear as they're rewritten, with a Stop button
- 🔒 **Secure**: JWT auth, per-user query scoping + RLS, per-user rate limit, optional daily quota, input validation

## Project Structure

```
rewriteflow/
├── shared/              steps.json (modes, steps, options) + fixtures both languages test against
├── presets/             starter workflows (YAML), used by the web app and the CLI
├── backend/             Hono API: src/{routes,middleware,controllers,db,services,lib}, test/
├── frontend/            React app: src/{pages,components,hooks,context,lib}, src/__tests__/
├── engine/              Python CLI: python -m engine …
├── tests/               CLI tests
├── db/                  schema.sql + migrations/
└── docs/                architecture, API, CLI, metrics, security…
```

## Styles

The UI shows friendly **labels**; the API, database and CLI use the **values**.

| Value | Label | Description |
|-------|-------|-------------|
| `standard` | Standard | Fresh wording, same meaning |
| `academic` | Professional | Formal register and polished structure |
| `aggressive` | Extensive | Rebuilds sentences and reorders ideas for flow |
| `simplified` | Clarified | Plain English for maximum readability |
| `creative` | Expressive | A more vivid, engaging rewrite |

Workflow steps and parameters are listed in [docs/TRANSFORM_NODES.md](docs/TRANSFORM_NODES.md).

## Quick Start

```bash
# 1. Clone
git clone https://github.com/shan3520/rewriteflow.git
cd rewriteflow

# 2. Database — run db/schema.sql in your Supabase SQL Editor
#    (existing databases: also run db/migrations/002_workflows.sql)

# 3. Backend
cd backend
cp .env.example .env    # then fill it in
npm install
npm run dev             # http://localhost:3000

# 4. Frontend (new terminal)
cd frontend
cp .env.example .env    # then fill it in
npm install
npm run dev             # http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key ([console.groq.com](https://console.groq.com)) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret (bypasses RLS) |
| `PORT` | Server port (default: 3000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS |
| `RATE_LIMIT_PER_MINUTE` | Rewrites per user per minute (default 20, 0 = off) |
| `DAILY_CHAR_LIMIT` | Characters per user per UTC day (default 0 = off) |
| `GROQ_MODEL` | Override the model (default `llama-3.3-70b-versatile`) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_BASE_URL` | Backend URL (default: http://localhost:3000) |

## Command-line tool

```bash
pip install -r requirements.txt
export GROQ_API_KEY=gsk_...
python -m engine presets
python -m engine run --workflow email_polish drafts/ --out polished/ --report run.json
python -m engine analyze original.md rewritten.md
```

See [docs/CLI_GUIDE.md](docs/CLI_GUIDE.md).

## Tests

```bash
cd backend && npm test                  # API
cd frontend && npm run lint && npm test # UI + analysis libs
python -m unittest discover tests       # CLI
```

## Database Setup

Run `db/schema.sql` in your Supabase SQL Editor to create the `users`, `rewrites` and `workflows` tables, the new-user trigger, and the RLS policies. Databases created before workflows existed also need [`db/migrations/002_workflows.sql`](db/migrations/002_workflows.sql). See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: how the pieces fit, request and data flow
- **[docs/BACKEND.md](docs/BACKEND.md)**: API reference and the ndjson streaming protocol
- **[docs/FRONTEND.md](docs/FRONTEND.md)** · **[FRONTEND_COMPONENTS.md](docs/FRONTEND_COMPONENTS.md)**: routes, state, components
- **[docs/CLI_GUIDE.md](docs/CLI_GUIDE.md)** · **[PLUGIN_GUIDE.md](docs/PLUGIN_GUIDE.md)**: command-line tool
- **[docs/PRESETS.md](docs/PRESETS.md)** · **[TRANSFORM_NODES.md](docs/TRANSFORM_NODES.md)** · **[PROMPT_TEMPLATES.md](docs/PROMPT_TEMPLATES.md)**: workflows, steps and how prompts are built
- **[docs/METRICS.md](docs/METRICS.md)**: meaning check, readability, diff
- **[docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** · **[BACKEND_SECURITY.md](docs/BACKEND_SECURITY.md)**
- **[docs/TESTING_BENCHMARKS.md](docs/TESTING_BENCHMARKS.md)** · **[CI_CD_PIPELINE.md](docs/CI_CD_PIPELINE.md)** · **[DOCKER_DEPLOYMENT.md](docs/DOCKER_DEPLOYMENT.md)**
- **[docs/PRODUCT.md](docs/PRODUCT.md)** · **[DESIGN.md](docs/DESIGN.md)**

## Deployment

- **Frontend → Vercel**: Set root directory to `frontend`, add env vars in dashboard
- **Backend → Render**: Auto-detected via `render.yaml`, add env vars in dashboard
- Set `ALLOWED_ORIGINS` on Render to your Vercel URL
- Set `VITE_API_BASE_URL` on Vercel to your Render URL

## License

Released under the [MIT License](LICENSE).
