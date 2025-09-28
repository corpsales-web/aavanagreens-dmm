# syntax=docker/dockerfile:1
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN yarn install --frozen-lockfile || yarn install
COPY . .
# Inject API base at build-time
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
RUN echo "Building with REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" && yarn build

FROM nginx:1.25-alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
# Basic nginx config for SPA routing
RUN printf "server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]