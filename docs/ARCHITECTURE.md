# Architecture

How RewriteFlow fits together: the pieces, the request flow, and the auth/data model.

## Components

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Frontend       │        │    Backend        │        │   Groq          │
│  React + Vite    │        │  Node.js + Hono   │        │  Llama 3.3 70B  │
│  (Vercel)        │        │  (Render)         │        │                 │
└────────┬────────┘        └────────┬─────────┘        └────────▲────────┘
         │                          │                            │
         │  1. auth (anon key)      │  2. verify JWT             │ 3. rewrite
         │  ───────────────────────┼──► (service-role key)      │    per paragraph
         ▼                          ▼                            │
┌──────────────────────────────────────────────┐               │
│                  Supabase                       │◄──────────────┘
│  Auth · Postgres (users, rewrites, workflows)   │  4. save result
└──────────────────────────────────────────────┘

┌─────────────────────────────┐
│  shared/                     │  steps.json: modes, steps, options
│  presets/                    │  starter workflows (YAML)
│  shared/fixtures/            │  expected results both languages test against
└──────────────┬──────────────┘
      read by the backend, the Python CLI and (via /api/steps) the frontend

┌─────────────────────────────┐
│  engine/  (Python CLI)       │  same modes/workflows on local files, calls Groq directly
└─────────────────────────────┘
```

| Concern | Where it lives | Key |
|---------|----------------|-----|
| Sign up / sign in | Frontend ↔ Supabase Auth | Supabase **anon** key (browser) |
| Rewrites, history, workflows | Frontend ↔ Backend ↔ Supabase | Backend uses the **service-role** key |
| AI rewriting | Backend ↔ Groq, or CLI ↔ Groq | `GROQ_API_KEY` (never in the browser) |
| Diff, meaning check, readability | Frontend only (`src/lib/`) and the CLI | none, runs locally |

## One step library, three consumers

`shared/steps.json` defines the five modes, the eleven workflow steps and the length/formality options. The backend builds system prompts from it (`backend/src/lib/prompts.js`), the Python CLI builds identical prompts (`engine/prompts/builder.py`), and the frontend renders the step picker from `GET /api/steps`. `shared/fixtures/prompts.json` is checked by both the backend and the CLI tests, so the two prompt builders can't drift apart. The same goes for the meaning check and readability code, which exist in JS (browser) and Python (CLI) and are both tested against `shared/fixtures/meaning_check.json` and `readability.json`.

## Authentication model

1. The user signs in through the Supabase JS client in the browser (anon key) and gets a session JWT.
2. The frontend sends it on every backend request: `Authorization: Bearer <access_token>`.
3. `middleware/auth.js` verifies it with `supabase.auth.getUser(token)` and puts the user on the request. The client never tells the server who it is.
4. The backend queries Postgres with the service-role key, which bypasses RLS, so **every query in `db/repository.js` is filtered by the verified user id**.

Row-level security on `users`, `rewrites` and `workflows` also restricts direct anon-key access to `auth.uid()`, as defense in depth. See [BACKEND_SECURITY.md](BACKEND_SECURITY.md).

## Rewrite request flow

```
AppPage (or BatchPage) → usePipelineRunner → lib/api.js
POST /api/rewrite { text, mode | workflowId | steps + custom_instruction, options } + Bearer token
        │
        ▼
auth → rate limiter (per user) → validate body → daily quota (optional)
        │
        ▼
controllers/pipelineController.js: resolve the instructions
   mode        → mode prompt
   workflowId  → starter (presets/*.yaml) or the user's saved workflow
   steps       → inline workflow
   + length/formality options → one system prompt
        │
        ▼
Split on blank lines. For each paragraph:
   emit {type:"progress"} → Groq (retries 429 with backoff) → emit {type:"paragraph"}
        │
        ▼
Save to `rewrites` (best effort) → emit {type:"result"} → close
```

A workflow's steps are composed into **one** instruction, so a five-step workflow still costs one Groq call per paragraph. The response is ndjson, and a client disconnect aborts processing. Event shapes are in [BACKEND.md](BACKEND.md).

After the result arrives, the frontend compares the original and the rewrite locally: word diff, readability before/after, and the meaning check. No extra server calls are made.

## Data model

```
auth.users ─(trigger)─► public.users ─1:many─► public.rewrites
                                     └─1:many─► public.workflows
```

Full column lists are in [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

## Deployment topology

| Piece | Host | Config |
|-------|------|--------|
| Frontend | Vercel | root dir `frontend`, [`frontend/vercel.json`](../frontend/vercel.json) |
| Backend | Render | [`render.yaml`](../render.yaml) builds from the repo root (it reads `shared/` and `presets/`), health check `/api/health` |
| Auth + DB | Supabase | [`db/schema.sql`](../db/schema.sql), plus [`db/migrations/`](../db/migrations) for existing databases |
| CLI | your machine | `pip install -r requirements.txt`, see [CLI_GUIDE.md](CLI_GUIDE.md) |
