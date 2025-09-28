# DMM Deployment (Kubernetes)

This deploys the Digital Marketing Manager as independent frontend + backend services under dmm.aavanagreens.in.

## 0) Prereqs
- NGINX Ingress Controller installed
- TLS via cert-manager (recommended) or your own TLS secret `dmm-tls`
- A container registry: replace `your-registry` in manifests

## 1) Build & Push Images
```
# Backend
cd dmm-backend
docker build -t your-registry/dmm-backend:latest .
docker push your-registry/dmm-backend:latest

# Frontend
cd ../dmm-frontend
# Set REACT_APP_BACKEND_URL at runtime using Nginx env or build-time. Recommended: build with prod API base
# For now, build static and serve; set API base via absolute URL in env before building.
docker build -t your-registry/dmm-frontend:latest .
docker push your-registry/dmm-frontend:latest
```

## 2) Create Namespace, Config, Secrets
```
kubectl apply -f deploy/dmm/namespace.yaml
kubectl -n dmm apply -f deploy/dmm/configmap.yaml
# Create secret with real values (do not commit)
kubectl -n dmm create secret generic dmm-secrets \
  --from-literal=MONGO_URL_DMM='YOUR_MONGO_URL' \
  --from-literal=DMM_JWT_SECRET='GENERATE_STRONG_SECRET'
```

## 3) Deploy Backend & Frontend
```
kubectl -n dmm apply -f deploy/dmm/backend.deployment.yaml
kubectl -n dmm apply -f deploy/dmm/backend.service.yaml
kubectl -n dmm apply -f deploy/dmm/frontend.deployment.yaml
kubectl -n dmm apply -f deploy/dmm/frontend.service.yaml
```

## 4) Ingress & DNS
```
kubectl -n dmm apply -f deploy/dmm/ingress.yaml
# Point DNS A/AAAA record for dmm.aavanagreens.in to your ingress load balancer IP
```

## 5) Verify
- Backend health: https://dmm.aavanagreens.in/api/health
- CORS: ensure `DMM_CORS_ORIGINS` includes both https://dmm.aavanagreens.in and your CRM origin
- Frontend loads: https://dmm.aavanagreens.in
- Create a campaign → Pending Approval → Approve

## Notes
- Frontend API base: Ensure REACT_APP_BACKEND_URL points to https://dmm.aavanagreens.in (or set via reverse proxy).
- RBAC, SSO, notifications, and strategy persistence will be added in the next phases.