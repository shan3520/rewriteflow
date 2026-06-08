# RewriteFlow Backend

A small [Hono](https://hono.dev) HTTP API that paraphrases text with **Llama 3.3 70B** (via Groq), streams progress back as newline-delimited JSON (ndjson), and persists results to Supabase.

- **Runtime:** Node.js (`@hono/node-server`)
- **AI:** `groq-sdk` → `llama-3.3-70b-versatile`
- **Data/Auth:** `@supabase/supabase-js` with the **service-role** key (bypasses RLS; the server is the trusted boundary)
- **Entry point:** [`backend/src/index.js`](../backend/src/index.js)

## Running locally

```bash
cd backend
# create a .env file with the variables below
npm install
npm run dev            # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | Groq API key ([console.groq.com](https://console.groq.com)) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service-role secret |
| `PORT` | — | Server port (default `3000`; Render uses `10000`) |
| `ALLOWED_ORIGINS` | — | Comma-separated allowed CORS origins. Defaults to localhost dev ports. |

If `SUPABASE_URL` or `GROQ_API_KEY` are missing, the server still boots but logs a warning and the relevant features degrade.

## Authentication

All `/api/*` endpoints except `/api/health` require a Supabase JWT:

```
Authorization: Bearer <supabase_access_token>
```

The token is verified server-side with `supabase.auth.getUser(token)`. A missing or invalid token returns **401**. The frontend obtains this token from the Supabase client session.

## Conventions

- **CORS** is locked to `ALLOWED_ORIGINS`; methods `GET, POST, DELETE, OPTIONS`.
- **Max input:** `text` may be up to **50,000 characters** (returns 400 if exceeded).
- Every request is logged as `METHOD path → status (durationms)`.
- Errors are returned as `{ "error": "message" }` with an appropriate status code.

---

## Endpoints

### `GET /`
Liveness ping. No auth.
```json
{ "status": "ok", "service": "RewriteAI API" }
```

### `GET /api/health`
Checks connectivity to Supabase and Groq. No auth. Returns **200** when both are reachable, **503** otherwise.
```json
{ "status": "healthy", "checks": { "groq": true, "supabase": true } }
```

### `POST /api/rewrite` 🔒
Rewrites `text` paragraph-by-paragraph and **streams** the result as ndjson. Paragraphs are split on blank lines (`\n\n+`).

**Request body**
```json
{ "text": "First paragraph...\n\nSecond paragraph...", "mode": "standard" }
```

| Field | Type | Notes |
|-------|------|-------|
| `text` | string | Required, non-empty, ≤ 50,000 chars |
| `mode` | string | One of the API values below. Defaults to `standard`. |

**Modes** (send the *value*, not the UI label):

| value | UI label | behavior |
|-------|----------|----------|
| `standard` | Standard | Preserve meaning, fresh wording |
| `academic` | Professional | Formal scholarly tone |
| `aggressive` | Extensive | Maximum restructuring, zero shared phrases |
| `simplified` | Clarified | Plain, simple English |
| `creative` | Expressive | Literary and engaging |

**Response:** `Content-Type: application/x-ndjson`, chunked. Each line is a standalone JSON object. Event types, in order:

| `type` | Shape | Meaning |
|--------|-------|---------|
| `progress` | `{ type, current, total }` | About to process paragraph `current` of `total` |
| `paragraph` | `{ type, text, current, total }` | A finished rewritten paragraph |
| `result` | `{ type, rewritten_text, original_word_count, rewritten_word_count }` | Final stitched result (terminal, on success) |
| `error` | `{ type, message }` | Processing failed (terminal) |

Example stream:
```
{"type":"progress","current":1,"total":2}
{"type":"paragraph","text":"Rewritten first paragraph.","current":1,"total":2}
{"type":"progress","current":2,"total":2}
{"type":"paragraph","text":"Rewritten second paragraph.","current":2,"total":2}
{"type":"result","rewritten_text":"...","original_word_count":120,"rewritten_word_count":118}
```

**Status codes:** `401` (auth), `400` (invalid JSON / missing text / too long / invalid mode). Once streaming begins (200), per-paragraph failures surface as an `error` event rather than an HTTP status.

**Reliability behavior:**
- Up to **3 attempts** per paragraph.
- On HTTP **429** (rate limit), retries with exponential backoff (`1000 × 2^attempt` ms).
- A fixed **500 ms** delay between paragraph calls to stay within rate limits.
- Client disconnects (`AbortSignal`) stop processing immediately and close the stream.
- On success the rewrite is saved to the `rewrites` table; a DB save failure is logged but does **not** fail the request (the user still receives `result`).

### `GET /api/history` 🔒
Returns the authenticated user's rewrites, newest first.
```json
{ "rewrites": [ { "id": "...", "original_text": "...", "rewritten_text": "...", "mode": "standard", "original_word_count": 120, "rewritten_word_count": 118, "created_at": "..." } ] }
```

### `DELETE /api/history/:id` 🔒
Deletes one rewrite **owned by the caller**. Ownership is verified before deletion.
- `200` → `{ "success": true }`
- `404` → not found or not owned by the user

---

## Deployment (Render)

Configured by [`render.yaml`](../render.yaml): `rootDir: backend`, `buildCommand: npm install`, `startCommand: node src/index.js`, health check at `/api/health`. Set `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ALLOWED_ORIGINS` (your Vercel URL) in the Render dashboard. The server handles `SIGTERM`/`SIGINT` for graceful shutdown.
