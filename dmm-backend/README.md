# dmm-backend (FastAPI)

Run locally
- python -m pip install -r requirements.txt
- uvicorn server:app --host 0.0.0.0 --port 8000

Env vars
- MONGO_URL_DMM: Mongo connection string
- DB_NAME_DMM: default aavana_dmm
- DMM_JWT_SECRET: HS256 secret for SSO deep-link (consumer)
- DMM_CORS_ORIGINS: comma-separated list of allowed origins (include https://dmm.aavanagreens.in and your CRM origin)

Endpoints
- GET /api/health
- POST /api/auth/sso/consume
- POST /api/marketing/save
- GET /api/marketing/list?type=&status=
- POST /api/marketing/approve

Deploy via GitHub on Emergent
- Create a Backend service → Source: GitHub → Repo: corpsales-web/aavana-dmm → Subpath: dmm-backend
- Dockerfile: dmm-backend/Dockerfile
- Runtime port: 8000; Health path: /api/health
- Add env vars above in the service settings
- Do not assign a public domain directly; UI is served by the frontend and will call /api via the shared domain

Expected repo link after Save to GitHub
- https://github.com/corpsales-web/aavana-dmm/tree/main/dmm-backend