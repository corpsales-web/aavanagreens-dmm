# Aavana DMM (Digital Marketing Manager)

Repository layout (single repo)
- dmm-backend: FastAPI service (port 8000) with /api routes
- dmm-frontend: React SPA served via NGINX (port 80)
- deploy/dmm: One-click deploy script and Kubernetes manifests (optional)

Planned GitHub location
- Org: corpsales-web
- Repo: aavana-dmm
- Expected links after Save to GitHub:
  - Backend: https://github.com/corpsales-web/aavana-dmm/tree/main/dmm-backend
  - Frontend: https://github.com/corpsales-web/aavana-dmm/tree/main/dmm-frontend
  - Deploy assets: https://github.com/corpsales-web/aavana-dmm/tree/main/deploy/dmm

How to save this code to GitHub (Emergent UI)
- Click "Save to GitHub" in the chat UI
- Choose organization: corpsales-web
- Repository name: aavana-dmm
- Visibility: your preference (private recommended)
- Confirm and push

No‑code deploy on Emergent (GitHub driven)
- Create Backend service from the GitHub repo
  - Subpath: dmm-backend
  - Dockerfile: dmm-backend/Dockerfile
  - Port: 8000; Health: GET /api/health
  - Env: MONGO_URL_DMM, DB_NAME_DMM=aavana_dmm, DMM_JWT_SECRET, DMM_CORS_ORIGINS="https://dmm.aavanagreens.in,https://dmm-platform.preview.emergentagent.com"
- Create Frontend service from the same repo
  - Subpath: dmm-frontend
  - Dockerfile: dmm-frontend/Dockerfile
  - Build ARG: REACT_APP_BACKEND_URL=https://dmm.aavanagreens.in
  - Port: 80
- Domain & routing
  - Custom domain: dmm.aavanagreens.in
  - Route / to frontend:80 and /api to backend:8000
  - Attach TLS (cert-manager or Emergent-managed)
- DNS
  - Point A/AAAA for dmm.aavanagreens.in to the Emergent ingress LB

Verification checklist
- https://dmm.aavanagreens.in renders the SPA
- https://dmm.aavanagreens.in/api/health returns { status: ok }
- Content → create item → appears in Approvals as Pending → Approve removes it

Zero‑downtime updates
- Push to main → Emergent auto‑builds and rolls out
- Rollback available from service revisions if needed

Contacts & Ops
- CORS tweaks: edit backend env DMM_CORS_ORIGINS in Emergent and restart (or redeploy)
- Frontend API base: REACT_APP_BACKEND_URL at build time (set in build ARG)