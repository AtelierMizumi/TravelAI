#!/usr/bin/env bash
# Smoke test for the production edge. Usage: scripts/smoke-edge.sh <base-url> [--mock-ai]
# Exits non-zero if any check fails.
set -u
BASE="${1:?usage: smoke-edge.sh <base-url>}"; BASE="${BASE%/}"
EVIL="https://evil.example"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail=0
code() { curl -sS -m 25 -o /dev/null -w '%{http_code}' "$@" 2>/dev/null || echo 000; }
check() { # description expected actual
  if [ "$2" = "$3" ]; then printf 'PASS  %s\n' "$1"; else printf 'FAIL  %s (expected %s, got %s)\n' "$1" "$2" "$3"; fail=1; fi
}

check "GET / (web)"                         200 "$(code "$BASE/")"
check "GET /api/places"                     200 "$(code "$BASE/api/places")"
check "GET /ai/ (AI health)"                200 "$(code "$BASE/ai/")"
check "GET /actuator/health hidden"         404 "$(code "$BASE/actuator/health")"
check "GET /swagger-ui/index.html hidden"   404 "$(code "$BASE/swagger-ui/index.html")"
check "GET /v3/api-docs hidden"             404 "$(code "$BASE/v3/api-docs")"

hdr=$(curl -sSI -m 25 "$BASE/" 2>/dev/null)
echo "$hdr" | grep -qi '^x-content-type-options: nosniff' && check "nosniff header" ok ok || check "nosniff header" ok missing

acao=$(curl -sSI -m 25 -X OPTIONS "$BASE/api/places" -H "Origin: $EVIL" -H 'Access-Control-Request-Method: GET' 2>/dev/null \
  | grep -i '^access-control-allow-origin' || true)
[ -z "$acao" ] && check "CORS rejects $EVIL" ok ok || check "CORS rejects $EVIL" "no ACAO" "$acao"

head -c $((11*1024*1024)) /dev/zero > "$tmp/big.jpg"
check "11 MB upload to /ai/detect rejected" 413 "$(code -X POST "$BASE/ai/detect" -F "file=@$tmp/big.jpg;type=image/jpeg" -F consent=true)"

exit $fail
