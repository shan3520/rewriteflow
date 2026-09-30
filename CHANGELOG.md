# Changelog

## [Unreleased]

### Fixed
- Restored `backend/package.json` (dependencies and `"type": "module"`); the 1.2.0 version dropped them, so the backend could not install or start.
- Python preset test no longer hardcodes a Windows path.
- CI now installs dependencies before building.
- `docker-compose.yml` no longer starts an unused Redis service.

### Docs
- README and `docs/ARCHITECTURE.md` describe the actual stack again (React + Hono + Groq + Supabase).
