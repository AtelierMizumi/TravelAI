#!/usr/bin/env bash
# Load demo data into the production stack through the public API. Safe to re-run.
# Usage: scripts/seed.sh [--dry-run]
# Steps: backup (pg_dump) -> make sure the demo admin exists and has the ADMIN role -> load catalog.
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/gen-secrets.sh >/dev/null
set -a; . ./.env; set +a
: "${PUBLIC_ORIGIN:?set PUBLIC_ORIGIN in .env}"
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-travelai-prod}"
db=$(docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml ps -q postgres-v2)
[ -n "$db" ] || { echo "postgres-v2 is not running: start the stack with scripts/up.sh" >&2; exit 1; }
admin="admin@demo.travelai.test"
dry=""; [ "${1:-}" = "--dry-run" ] && dry="--dry-run"

if [ -z "$dry" ]; then
  mkdir -p "$HOME/backups"; chmod 700 "$HOME/backups"
  out="$HOME/backups/travelai-$(date +%F-%H%M%S).sql"
  docker exec "$db" pg_dump -U travelai_user travel_ai > "$out"
  chmod 600 "$out"
  echo "backup: $out ($(wc -c < "$out") bytes)"
fi

python3 -I scripts/seed/seed_demo.py ensure-admin --base-url "$PUBLIC_ORIGIN" --admin-email "$admin" $dry
if [ -z "$dry" ]; then
  docker exec "$db" psql -U travelai_user -d travel_ai -v ON_ERROR_STOP=1 -qc \
    "UPDATE users SET role='ADMIN' WHERE email='$admin'"
fi
python3 -I scripts/seed/seed_demo.py catalog --base-url "$PUBLIC_ORIGIN" --admin-email "$admin" $dry
