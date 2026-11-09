#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-travelai-prod}"
docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml down --remove-orphans
