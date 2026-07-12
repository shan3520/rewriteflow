# Database Schema Specifications

## Tables

### `pipeline_templates`
- `id` (VARCHAR(64), PK)
- `name` (VARCHAR(255), UNIQUE)
- `config` (JSONB)

### `rewrite_jobs`
- `id` (VARCHAR(64), PK)
- `original_text` (TEXT)
- `rewritten_text` (TEXT)
- `status` (VARCHAR(32))
