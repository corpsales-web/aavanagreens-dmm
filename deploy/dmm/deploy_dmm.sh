#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"/../.. && pwd)
DMM_DIR="$ROOT_DIR/deploy/dmm"
BACKEND_DIR="$ROOT_DIR/dmm-backend"
FRONTEND_DIR="$ROOT_DIR/dmm-frontend"

if [[ ! -f "$DMM_DIR/.env" ]]; then
  echo "[ERR] Missing $DMM_DIR/.env. Copy .env.example to .env and edit your values." >&2
  exit 1
fi
# shellcheck disable=SC1091
source "$DMM_DIR/.env"

# Helper: require command
req() { command -v "$1" >/dev/null 2>&1 || { echo "[ERR] Missing command: $1"; exit 1; }; }
req docker
req kubectl

# Validate required vars
: "${REGISTRY:?set in .env}"
: "${BACKEND_IMAGE:?set in .env}"
: "${FRONTEND_IMAGE:?set in .env}"
: "${IMAGE_TAG:?set in .env}"
: "${DMM_DOMAIN:?set in .env}"
: "${MONGO_URL_DMM:?set in .env}"
: "${DB_NAME_DMM:?set in .env}"
: "${DMM_JWT_SECRET:?set in .env}"
: "${REACT_APP_BACKEND_URL:?set in .env}"
: "${TLS_SECRET_NAME:?set in .env}"

DMM_CORS_ORIGINS="https://$DMM_DOMAIN"
if [[ -n "${CRM_ORIGIN:-}" ]]; then
  DMM_CORS_ORIGINS+=",$CRM_ORIGIN"
fi
if [[ -n "${EXTRA_CORS_ORIGINS:-}" ]]; then
  DMM_CORS_ORIGINS+=",$EXTRA_CORS_ORIGINS"
fi

BACKEND_REF="$REGISTRY/$BACKEND_IMAGE:$IMAGE_TAG"
FRONTEND_REF="$REGISTRY/$FRONTEND_IMAGE:$IMAGE_TAG"

step() { echo -e "\n===== $* ====="; }

step "1) Build & push backend image: $BACKEND_REF"
(
  cd "$BACKEND_DIR"
  docker build -t "$BACKEND_REF" .
  docker push "$BACKEND_REF"
)

step "2) Build & push frontend image: $FRONTEND_REF (API base: $REACT_APP_BACKEND_URL)"
(
  cd "$FRONTEND_DIR"
  docker build --build-arg REACT_APP_BACKEND_URL="$REACT_APP_BACKEND_URL" -t "$FRONTEND_REF" .
  docker push "$FRONTEND_REF"
)

step "3) Create namespace dmm (idempotent)"
kubectl apply -f "$DMM_DIR/namespace.yaml"

step "4) Create/Update ConfigMap dmm-config (DB_NAME_DMM, DMM_CORS_ORIGINS)"
# Use CLI-driven ConfigMap to avoid editing YAML
kubectl -n dmm create configmap dmm-config \
  --from-literal=DB_NAME_DMM="$DB_NAME_DMM" \
  --from-literal=DMM_CORS_ORIGINS="$DMM_CORS_ORIGINS" \
  -o yaml --dry-run=client | kubectl apply -f -

echo "ConfigMap applied with DMM_CORS_ORIGINS=$DMM_CORS_ORIGINS"

step "5) Create/Update Secret dmm-secrets (MONGO_URL_DMM, DMM_JWT_SECRET)"
kubectl -n dmm create secret generic dmm-secrets \
  --from-literal=MONGO_URL_DMM="$MONGO_URL_DMM" \
  --from-literal=DMM_JWT_SECRET="$DMM_JWT_SECRET" \
  -o yaml --dry-run=client | kubectl apply -f -

step "6) Apply backend + service"
kubectl -n dmm apply -f "$DMM_DIR/backend.deployment.yaml"
kubectl -n dmm apply -f "$DMM_DIR/backend.service.yaml"

step "7) Apply frontend + service"
kubectl -n dmm apply -f "$DMM_DIR/frontend.deployment.yaml"
kubectl -n dmm apply -f "$DMM_DIR/frontend.service.yaml"

step "8) Set images on deployments"
kubectl -n dmm set image deployment/dmm-backend dmm-backend="$BACKEND_REF"
kubectl -n dmm set image deployment/dmm-frontend dmm-frontend="$FRONTEND_REF"

step "9) Wait for rollout (backend, frontend)"
kubectl -n dmm rollout status deployment/dmm-backend --timeout=180s || true
kubectl -n dmm rollout status deployment/dmm-frontend --timeout=180s || true

step "10) Apply ingress for $DMM_DOMAIN (TLS: $TLS_SECRET_NAME)"
cat <<YAML | kubectl -n dmm apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dmm-ingress
  namespace: dmm
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/proxy-body-size: "20m"
spec:
  tls:
  - hosts: ["$DMM_DOMAIN"]
    secretName: $TLS_SECRET_NAME
  rules:
  - host: $DMM_DOMAIN
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: dmm-backend
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dmm-frontend
            port:
              number: 80
YAML

step "11) Show resources"
kubectl -n dmm get pods,svc,ingress -o wide

echo "\nIf Ingress ADDRESS is pending, ensure DNS A/AAAA record for $DMM_DOMAIN points to your Ingress LB.\n"

step "12) Quick health checks (best-effort)"
set +e
curl -skSf "https://$DMM_DOMAIN/api/health" || echo "[WARN] Backend health check failed (TLS/DNS may still be propagating)."
set -e

echo "\nDone.\nNext: open https://$DMM_DOMAIN (UI) and https://$DMM_DOMAIN/api/health (backend)."