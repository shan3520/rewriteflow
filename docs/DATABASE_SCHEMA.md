# Database schema

Supabase Postgres. Fresh projects run [`db/schema.sql`](../db/schema.sql). Projects created from an older schema also run [`db/migrations/002_workflows.sql`](../db/migrations/002_workflows.sql) once. It is safe to re-run.

## `public.users`

Mirrors `auth.users` through the `on_auth_user_created` trigger. Columns: `id` (= auth user id), `email`, `created_at`.

## `public.rewrites`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `user_id` | uuid → users | cascade delete |
| `original_text`, `rewritten_text` | text | |
| `mode` | text | `standard`, `academic`, `aggressive`, `simplified`, `creative`, or `workflow` |
| `workflow_name` | text, nullable | set when `mode = 'workflow'` |
| `original_word_count`, `rewritten_word_count` | int | |
| `created_at` | timestamptz | |

## `public.workflows`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `user_id` | uuid → users | cascade delete |
| `name` | text | 1–80 chars |
| `description` | text | |
| `steps` | jsonb | `[{ "id": "grammar" }, { "id": "translate", "params": { "lang": "French" } }]` |
| `custom_instruction` | text | |
| `created_at`, `updated_at` | timestamptz | index on `(user_id, updated_at desc)` |

## Row-level security

All three tables have RLS enabled with policies limiting select/insert/update/delete to `auth.uid() = user_id` (or `= id` for users). The backend uses the service-role key and applies the same scoping in code; see [BACKEND_SECURITY.md](BACKEND_SECURITY.md).
