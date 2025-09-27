# DMM Backend (FastAPI)

Production-ready scaffold for Digital Marketing Manager, isolated from CRM.

## Features
- /api/health
- /api/auth/sso/consume (JWT deep-link)
- /api/marketing/save, /api/marketing/list, /api/marketing/approve
- Reuses marketing_* Mongo collections (no migration)

## Env Vars
- MONGO_URL_DMM: mongodb connection string
- DB_NAME_DMM: database name (default aavana_dmm)
- DMM_JWT_SECRET: HS256 secret for SSO token validation
- DMM_CORS_ORIGINS: comma-separated list of allowed origins

## Run (local)
```
uvicorn server:app --host 0.0.0.0 --port 8002 --reload
```

## Notes
- All IDs are strings (uuid4). No ObjectId leaks.
- Timestamps are ISO strings (UTC).
- Extend with AI endpoints later; keep approval-gated.