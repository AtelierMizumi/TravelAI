#!/usr/bin/env bash
# Recreate production services so a changed ~/deploy/travelai/.env takes effect.
# The deploy agent does nothing when the commit is unchanged, and a bare `docker compose up`
# misses the edge/release files and image tag. This uses exactly the agent's compose setup.
# Usage: scripts/prod-apply.sh [service ...]   (default: backend-v2)
set -uo pipefail
DEPLOY_DIR="${DEPLOY_DIR:-$HOME/deploy}"
APP_DIR="${APP_DIR:-$DEPLOY_DIR/travelai}"
DOCKER="${DOCKER:-docker}"
SMOKE="${SMOKE:-bash scripts/smoke-edge.sh}"
SMOKE_RETRIES="${SMOKE_RETRIES:-4}"; SMOKE_WAIT="${SMOKE_WAIT:-15}"
SERVICES=("$@"); [ ${#SERVICES[@]} -gt 0 ] || SERVICES=(backend-v2)

tag=$(cat "$DEPLOY_DIR/state/current.tag" 2>/dev/null || true)
[ -n "$tag" ] || { echo "No deployed release tag in $DEPLOY_DIR/state/current.tag: let the deploy agent run first." >&2; exit 2; }

(cd "$APP_DIR" && COMPOSE_PROJECT_NAME=travelai-prod TRAVELAI_TAG="$tag" "$DOCKER" compose \
   -f docker-compose.yml -f docker-compose.edge.yml -f docker-compose.release.yml \
   up -d --no-build --force-recreate --wait "${SERVICES[@]}") || { echo "compose up failed for ${SERVICES[*]}" >&2; exit 1; }

origin=$(grep '^PUBLIC_ORIGIN=' "$APP_DIR/.env" | cut -d= -f2-)
for ((i = 1; i <= SMOKE_RETRIES; i++)); do
  (cd "$APP_DIR" && SEEDED=1 $SMOKE "$origin") >/dev/null 2>&1 && { echo "applied ${SERVICES[*]} on $tag: smoke OK"; exit 0; }
  sleep "$SMOKE_WAIT"
done
echo "applied ${SERVICES[*]} on $tag but smoke FAILED" >&2; exit 1
