#!/usr/bin/env bash
# End-to-end smoke test for the running TravelAI stack (docker compose up).
# Exercises the merged WBS packages through the same entrypoint a browser uses.
#
# Usage: scripts/smoke.sh
#        BASE_URL=http://host:3000 AI_URL=http://host:8000 scripts/smoke.sh
set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
AI_URL="${AI_URL:-http://localhost:8000}"

for tool in curl jq python3; do
  command -v "$tool" >/dev/null 2>&1 || { echo "missing required tool: $tool" >&2; exit 2; }
done

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

pass=0
fail=0
STATUS=""
BODY=""

# http <method> <url> [curl args...]: records status, headers and body of the call.
http() {
  local method="$1" url="$2"
  shift 2
  STATUS="$(curl -sS -o "$WORKDIR/body" -D "$WORKDIR/response_headers" -w '%{http_code}' \
    --max-time 20 -X "$method" "$url" "$@" 2>"$WORKDIR/curl.err")" || STATUS="000"
  BODY="$(cat "$WORKDIR/body" 2>/dev/null)"
}

assert_status() {
  [ "$STATUS" = "$1" ] && return 0
  echo "expected HTTP $1, got $STATUS $(head -c 200 "$WORKDIR/curl.err")"
  return 1
}

assert_jq() {
  echo "$BODY" | jq -e "$1" >/dev/null 2>&1 && return 0
  echo "jq assertion failed: $1"
  echo "body: $(echo "$BODY" | head -c 300)"
  return 1
}

assert_problem_json() {
  grep -qi '^content-type: application/problem+json' "$WORKDIR/response_headers" && return 0
  echo "response is not application/problem+json"
  return 1
}

# check <description> <assertions>: assertions run in this shell via eval.
check() {
  if eval "$2" >"$WORKDIR/check.log" 2>&1; then
    printf 'PASS  %s\n' "$1"
    pass=$((pass + 1))
  else
    printf 'FAIL  %s\n' "$1"
    sed 's/^/        /' "$WORKDIR/check.log" | head -4
    fail=$((fail + 1))
  fi
}

# --- fixtures ---------------------------------------------------------------
# 64x64 RGB PNG generated without third-party libraries.
python3 - "$WORKDIR/landmark.png" <<'PY'
import struct
import sys
import zlib


def chunk(tag, data):
    body = tag + data
    return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)


width = height = 64
rows = b"".join(
    b"\x00" + bytes(c for x in range(width) for c in (x * 4 % 256, y * 4 % 256, 128))
    for y in range(height)
)
png = (
    b"\x89PNG\r\n\x1a\n"
    + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    + chunk(b"IDAT", zlib.compress(rows))
    + chunk(b"IEND", b"")
)
open(sys.argv[1], "wb").write(png)
PY
printf 'not an image' >"$WORKDIR/notes.txt"

STAMP="$(date +%s)$RANDOM"
USERNAME="smoke_$STAMP"
EMAIL="smoke_$STAMP@example.com"
PASSWORD="$(python3 -c 'import secrets; print(secrets.token_urlsafe(16))')"
JSON='Content-Type: application/json'

echo "TravelAI smoke test -> gateway: $BASE_URL, ai: $AI_URL"
echo

# --- infrastructure ---------------------------------------------------------
http GET "$BASE_URL/"
check "gateway serves the SPA shell" \
  "assert_status 200 && grep -qi '<div id=\"root\"' '$WORKDIR/body'"

http GET "$BASE_URL/api/v1/health"
check "backend health through gateway reports UP" \
  "assert_status 200 && assert_jq '.status == \"UP\"'"

http GET "$AI_URL/health"
check "ai-service health responds 200" "assert_status 200"

# --- auth (WBS 1.2.1) -------------------------------------------------------
http POST "$BASE_URL/api/v1/auth/register" -H "$JSON" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"fullName\":\"Smoke Tester\"}"
check "register creates a user (201)" \
  "assert_status 201 && assert_jq '.username == \"$USERNAME\"'"

http POST "$BASE_URL/api/v1/auth/login" -H "$JSON" \
  -d "{\"usernameOrEmail\":\"$USERNAME\",\"password\":\"$PASSWORD\"}"
check "login returns access and refresh tokens" \
  "assert_status 200 && assert_jq '(.accessToken|length > 0) and (.refreshToken|length > 0)'"

http POST "$BASE_URL/api/v1/locations" -H "$JSON" -d '{}'
check "write endpoint without token is rejected (401, problem+json)" \
  "assert_status 401 && assert_problem_json"

# --- location catalog (WBS 1.7.2 / 1.4.1) -----------------------------------
http GET "$BASE_URL/api/v1/locations?size=5"
check "seeded locations are listed" \
  "assert_status 200 && assert_jq '.content|length >= 1'"
LOCATION_ID="$(echo "$BODY" | jq -r '.content[0].id // 0' 2>/dev/null || echo 0)"

http GET "$BASE_URL/api/v1/locations/$LOCATION_ID"
check "location detail is retrievable by id" \
  "assert_status 200 && assert_jq '.id == $LOCATION_ID'"

# --- tour catalog (WBS 1.4.2) -----------------------------------------------
http GET "$BASE_URL/api/v1/tours/by-location/$LOCATION_ID"
check "tours by location returns a JSON array" \
  "assert_status 200 && assert_jq 'type == \"array\"'"

http GET "$BASE_URL/api/v1/tours?size=5"
check "tour list without filters returns a page" \
  "assert_status 200 && assert_jq '.content|type == \"array\"'"

http GET "$BASE_URL/api/v1/tours?keyword=a&province=a&duration=a&size=5"
check "tour search with text filters returns a page" \
  "assert_status 200 && assert_jq '.content|type == \"array\"'"

http GET "$BASE_URL/api/v1/locations?keyword=a&province=a&category=a&size=5"
check "location search with text filters returns a page" \
  "assert_status 200 && assert_jq '.content|type == \"array\"'"

# --- AI vision (WBS 1.3.1 / 1.3.2 / 1.3.3) ----------------------------------
http POST "$BASE_URL/api/v1/vision/recognize" -F "image=@$WORKDIR/landmark.png;type=image/png"
check "recognize through gateway identifies a landmark" \
  "assert_status 200 && assert_jq '.success == true and (.landmark_name|length > 0) and (.confidence >= 0 and .confidence <= 1)'"

http POST "$BASE_URL/api/v1/vision/recognize" -F "image=@$WORKDIR/notes.txt;type=text/plain"
check "recognize rejects non-image uploads (415, problem+json)" \
  "assert_status 415 && assert_problem_json"

http GET "$BASE_URL/api/v1/vision/history?limit=5"
check "recognition history records the earlier request" \
  "assert_status 200 && assert_jq '.total >= 1 and (.items|length >= 1)'"

echo
echo "Result: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
