# dmm-frontend (React + Vite + NGINX)

Run locally
- yarn
- REACT_APP_BACKEND_URL=http://localhost:8000 yarn dev

Build
- REACT_APP_BACKEND_URL must be defined at build time
- yarn build

Docker build
- docker build --build-arg REACT_APP_BACKEND_URL=https://dmm.aavanagreens.in -t your-registry/dmm-frontend:latest .

Deploy via GitHub on Emergent
- Create a Frontend service → Source: GitHub → Repo: corpsales-web/aavana-dmm → Subpath: dmm-frontend
- Dockerfile: dmm-frontend/Dockerfile
- Build ARG: REACT_APP_BACKEND_URL=https://dmm.aavanagreens.in
- Runtime port: 80
- Custom domain: dmm.aavanagreens.in
- Routing: / → frontend (80), /api → backend (8000)

Expected repo link after Save to GitHub
- https://github.com/corpsales-web/aavana-dmm/tree/main/dmm-frontend