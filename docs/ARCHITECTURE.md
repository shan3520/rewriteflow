# Architecture

How RewriteFlow fits together end-to-end: the pieces, the request flow, and the auth/data model.

## Components

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Frontend       │        │    Backend        │        │   Groq          │
│  React + Vite    │        │  Node.js + Hono   │        │  Llama 3.3 70B  │
│  (Vercel)        │        │  (Render)         │        │                 │
└────────┬────────┘        └────────┬─────────┘        └────────▲────────┘
         │                          │                            │
         │  1. auth (anon key)      │  4. verify JWT             │ 5. paraphrase
         │  ───────────────────────┼──► (service-role key)      │    per paragraph
         │                          │                            │
         ▼                          ▼                            │
┌──────────────────────────────────────────────┐               │
│                  Supabase                       │◄──────────────┘
│  Auth · PostgreSQL (users, rewrites) · RLS      │  6. save result
└──────────────────────────────────────────────┘
```

| Concern | Where it lives | Key client/key |
|---------|----------------|----------------|
| Sign up / sign in | Frontend ↔ Supabase Auth | Supabase **anon** key (browser) |
| Rewrite + history | Frontend ↔ Backend ↔ Supabase | Backend uses Supabase **service-role** key |
| AI paraphrasing | Backend ↔ Groq | `GROQ_API_KEY` (server only) |

The browser never holds the Groq key or the service-role key. The backend is the trusted boundary.

## Authentication model

1. The user signs in through the **Supabase JS client in the browser** (anon key). Supabase returns a session with an `access_token` (JWT).
2. The frontend attaches that token to every backend request: `Authorization: Bearer <access_token>`.
3. The backend verifies the token on each protected route via `supabase.auth.getUser(token)` and derives the `user.id` from it — the client never tells the server who it is.
4. The backend then talks to Postgres using the **service-role** key, which bypasses RLS. Because the server scopes every query by the verified `user.id`, users only ever touch their own rows.

**Row Level Security** (see [`../db/schema.sql`](../db/schema.sql)) is defined on `users` and `rewrites` so that *direct* access with the anon key is also restricted to `auth.uid()` — defense in depth for any future client-side queries.

## Rewrite request flow

```
User clicks "Rewrite" in AppPage
        │
        ▼
lib/api.js → POST /api/rewrite  { text, mode } + Bearer token
        │
        ▼
Backend: verify JWT ─► validate body (non-empty, ≤50k chars, valid mode)
        │
        ▼
Split text on blank lines into paragraphs
        │
        ▼
For each paragraph:
   emit  {type:"progress", current, total}
   call Groq (system prompt = mode) ──► up to 3 tries, exp. backoff on 429
   emit  {type:"paragraph", text, current, total}
   wait 500ms (rate-limit cushion)
        │
        ▼
Stitch paragraphs ─► save row to `rewrites` (best-effort)
        │
        ▼
emit  {type:"result", rewritten_text, word counts}  ─► stream closes
```

The response is **ndjson** (`application/x-ndjson`, chunked). The frontend reads the stream incrementally so the user sees each paragraph and a live progress count as they complete, rather than waiting for the whole job. A client disconnect aborts processing immediately. Full event shapes are documented in [`BACKEND.md`](BACKEND.md).

## Data model

```
auth.users (Supabase-managed)
     │  trigger: handle_new_user()  on INSERT
     ▼
public.users         id (=auth.users.id), email, created_at
     │  1───many
     ▼
public.rewrites      id, user_id, original_text, rewritten_text,
                     mode, original_word_count, rewritten_word_count, created_at
```

- A Postgres trigger mirrors each new auth user into `public.users` automatically on signup.
- `mode` is constrained to the five API values (`standard`, `academic`, `aggressive`, `simplified`, `creative`).
- Deleting a user cascades to their rewrites; deleting an auth user cascades to `public.users`.

## Why these choices

- **Paragraph-by-paragraph streaming** keeps long documents responsive and gives honest progress feedback (a core product principle in [PRODUCT.md](PRODUCT.md)) instead of one long opaque wait.
- **Server-side AI calls** keep API keys off the client and let the backend own retries, backoff, and rate-limit pacing.
- **Service-role on the server + RLS on the database** gives a single trusted query path while still hardening the database against direct client access.

## Deployment topology

| Piece | Host | Config |
|-------|------|--------|
| Frontend | Vercel | root dir `frontend`, [`frontend/vercel.json`](../frontend/vercel.json) |
| Backend | Render | [`render.yaml`](../render.yaml), health check `/api/health` |
| Auth + DB | Supabase | schema from [`db/schema.sql`](../db/schema.sql) |

CORS on the backend is restricted to `ALLOWED_ORIGINS` (the Vercel URL), and the frontend targets the backend via `VITE_API_BASE_URL`.
