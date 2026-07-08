# RewriteFlow Express Backend Service

## API Routes

- `GET /api/v1/pipelines` - List available pipelines
- `POST /api/v1/pipelines` - Create new pipeline definition
- `POST /api/v1/rewrite` - Execute rewrite workflow on text
  - Body: `{ "text": "String", "pipeline": { ... } }`
