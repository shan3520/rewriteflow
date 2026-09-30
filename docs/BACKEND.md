# Backend API

Hono on Node 20. Entry point `backend/src/index.js` (reads env, starts the server). The app itself is built by `createApp()` in `backend/src/app.js`, which takes the Groq and Supabase clients as arguments so tests can pass fakes.

```
src/
  app.js                       createApp({ groq, supabase, config })
  index.js                     env → createApp → serve
  routes/        rewrite.js · history.js · pipelines.js · health.js
  middleware/    auth.js · rateLimiter.js · costEstimator.js (daily quota) · validate.js · errorHandler.js
  controllers/   pipelineController.js   (mode/workflow → system prompt)
  db/            repository.js           (all Supabase queries, scoped by user)
  services/      streamEmitter.js        (ndjson Response helper)
  lib/           groq.js (retrying rewriter) · prompts.js · library.js (steps + presets) · abort.js
test/            node:test suites + in-memory fake Supabase/Groq
```

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `GROQ_API_KEY` | — | Groq key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Model id |
| `GROQ_BASE_URL` | Groq | Only for pointing at a local mock |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | — | Supabase project (service role) |
| `ALLOWED_ORIGINS` | localhost:5173/5174/4173 | Comma-separated CORS origins |
| `RATE_LIMIT_PER_MINUTE` | `20` | Rewrite requests per user per minute (`0` disables) |
| `DAILY_CHAR_LIMIT` | `0` (off) | Characters each user may rewrite per UTC day |
| `PORT` | `3000` | |

## Endpoints

Authenticated routes need `Authorization: Bearer <supabase access token>`. Errors are JSON `{ "error": "message" }`.

### `POST /api/rewrite` (auth, rate-limited)

Exactly one instruction source:

```jsonc
{ "text": "…", "mode": "standard" }                       // standard | academic | aggressive | simplified | creative
{ "text": "…", "workflowId": "starter:email_polish" }     // starter id or a saved workflow's uuid
{ "text": "…", "steps": ["grammar", {"id": "translate", "params": {"lang": "French"}}],
  "custom_instruction": "Keep product names." }           // inline workflow
```

Optional `"options": { "length": "shorter|same|longer", "formality": "casual|neutral|formal" }` applies to any source. Text is at most 50,000 characters.

Response: `application/x-ndjson`, one JSON object per line:

| `type` | Fields | When |
|--------|--------|------|
| `progress` | `current`, `total` | before each paragraph |
| `paragraph` | `text`, `current`, `total` | each paragraph as it finishes |
| `result` | `rewritten_text`, `original_word_count`, `rewritten_word_count` | once, at the end |
| `error` | `message` | a paragraph failed after retries; the stream then closes |

Status codes before streaming: `400` invalid body, `401` auth, `404` unknown workflow, `429` rate limit (with `Retry-After`) or daily quota.

### Steps and workflows

| Method & path | Auth | Returns |
|---------------|------|---------|
| `GET /api/steps` | no | `{ steps, modes: {id: label}, options: {length: [...], formality: [...]} }` |
| `GET /api/workflows/starters` | no | `{ workflows }` from `presets/*.yaml`, ids `starter:<file>` |
| `GET /api/workflows` | yes | `{ workflows }` for the signed-in user, newest first |
| `POST /api/workflows` | yes | `201 { workflow }` |
| `PUT /api/workflows/:id` | yes | `{ workflow }`, `404` if not yours |
| `DELETE /api/workflows/:id` | yes | `{ success: true }`, `404` if not yours |

Workflow body: `{ name (≤80), description?, steps: [...] (≤10), custom_instruction? (≤1000) }`, with at least one step or an instruction.

### History

| Method & path | Returns |
|---------------|---------|
| `GET /api/history` | `{ rewrites }`, newest first. Workflow rewrites have `mode: "workflow"` and `workflow_name`. |
| `DELETE /api/history/:id` | `{ success: true }`, `404` if not yours |

### Health

`GET /api/health` → `200 { status: "healthy", checks: { groq, supabase } }`, or `503` with `status: "degraded"`.

## Tests

```bash
cd backend && npm test
```

Covers prompt building (including parity with `shared/fixtures/prompts.json`), validation, the rate limiter, the quota, the retrying rewriter, and every route through `app.request()` with fake Groq and Supabase (streaming, auth, per-user scoping).
