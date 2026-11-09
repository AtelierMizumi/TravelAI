#!/usr/bin/env bash
# Static checks for the edge overlay (no containers started).
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0
ok()  { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

export POSTGRES_PASSWORD=x HOST_GCP_KEY=/dev/null HOST_MESSAGE_KEY=/dev/null \
       CLOUDFLARE_TUNNEL_TOKEN=x PUBLIC_ORIGIN=https://travelai.example
rendered=$(docker compose --profile v2 -f docker-compose.yml -f docker-compose.edge.yml config 2>&1) \
  && ok "compose config renders" || { bad "compose config renders"; echo "$rendered" | head -5; }

grep -q 'reverse_proxy backend-v2:8080' deploy/Caddyfile && ok "caddy -> backend-v2:8080" || bad "caddy -> backend-v2:8080"
grep -q 'reverse_proxy ai-v2:8000'      deploy/Caddyfile && ok "caddy -> ai-v2:8000"      || bad "caddy -> ai-v2:8000"
grep -q 'handle @internal' deploy/Caddyfile && ok "actuator/swagger blocked by handle" || bad "actuator/swagger blocked by handle"

for svc in caddy cloudflared postgres-v2 ai-v2 backend-v2; do
  section=$(echo "$rendered" | awk -v s="  $svc:" '$0==s{f=1;next} f&&/^  [a-z]/{f=0} f')
  if echo "$section" | grep -q 'published:'; then bad "$svc publishes a host port"; else ok "$svc publishes no host port"; fi
done
echo "$rendered" | grep -q 'CORS_ALLOWED_ORIGINS: https://travelai.example' && ok "backend CORS = PUBLIC_ORIGIN" || bad "backend CORS = PUBLIC_ORIGIN"
echo "$rendered" | grep -q 'TRAVELAI_MESSAGE_KEY_REQUIRED: "true"' && ok "message key required in prod" || bad "message key required in prod"
exit $fail
