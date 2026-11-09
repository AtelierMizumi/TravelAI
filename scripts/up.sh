#!/usr/bin/env bash
# Build the web bundle and start the production stack (Caddy + cloudflared + v2 services).
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/gen-secrets.sh
set -a; . ./.env; set +a
: "${PUBLIC_ORIGIN:?set PUBLIC_ORIGIN in .env}"
: "${HOST_GCP_KEY:?set HOST_GCP_KEY (path to the service-account JSON) in .env}"
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-travelai-prod}"

( cd apps/mobile
  EXPO_PUBLIC_API_URL="$PUBLIC_ORIGIN/api" EXPO_PUBLIC_AI_API_URL="$PUBLIC_ORIGIN/ai" \
    npx expo export -p web --output-dir dist )

# expo export recreates dist/, which orphans Caddy's bind mount: always recreate Caddy.
docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml rm -sf caddy >/dev/null 2>&1 || true
docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml up -d --build --wait postgres-v2 ai-v2 backend-v2 caddy cloudflared
echo "stack is up: $PUBLIC_ORIGIN"
