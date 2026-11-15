#!/usr/bin/env bash
# Two-browser-context E2E runner for community visibility (Task 8).
# Starts an isolated Postgres + the backend jar, promotes an admin via psql,
# then drives two independent Playwright browser contexts against real HTTP.
# Env knobs: CHROMIUM_PATH (defaults to the ms-playwright chromium on this host).
set -euo pipefail

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_root=$(mktemp -d /tmp/travelai-e2e-XXXXXX)
test_port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
app_port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
cleanup() {
  [[ -n "${APP_PID:-}" ]] && kill "$APP_PID" 2>/dev/null || true
  if [[ -f "$test_root/postgres/postmaster.pid" ]]; then
    pg_ctl -D "$test_root/postgres" -m fast -w stop >> "$test_root/postgres.log" 2>&1 || true
  fi
}
trap cleanup EXIT

initdb -D "$test_root/postgres" -U travelai_test -A trust --no-locale > "$test_root/initdb.log"
pg_ctl -D "$test_root/postgres" -l "$test_root/postgres.log" -o "-h 127.0.0.1 -p $test_port -k $test_root" -w start
createdb -h 127.0.0.1 -p "$test_port" -U travelai_test travelai_test

export TRAVELAI_TEST_DB_URL="jdbc:postgresql://127.0.0.1:$test_port/travelai_test"
export TRAVELAI_TEST_DB_USER=travelai_test
export TRAVELAI_TEST_DB_PASSWORD=synthetic-test-only
export SPRING_PROFILES_ACTIVE=test
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk

JAR=$(ls "$repo_root/backend/target/backend-"*.jar | head -1)
[[ -n "$JAR" ]] || { echo "Backend jar not found; run ./mvnw -o -Djava.version=21 -DskipTests package in backend/ first" >&2; exit 1; }

java -jar "$JAR" \
  --server.port="$app_port" \
  --spring.datasource.url="$TRAVELAI_TEST_DB_URL" \
  --spring.datasource.username="$TRAVELAI_TEST_DB_USER" \
  --spring.datasource.password="$TRAVELAI_TEST_DB_PASSWORD" \
  --spring.jpa.hibernate.ddl-auto=create-drop \
  > "$test_root/backend.log" 2>&1 &
APP_PID=$!

for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:$app_port/api/system-settings" > /dev/null; then break; fi
  sleep 2
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    echo "Backend exited early" >&2; tail -30 "$test_root/backend.log" >&2; exit 1
  fi
done
curl -sf "http://127.0.0.1:$app_port/api/system-settings" > /dev/null || { echo "Backend not ready" >&2; exit 1; }

ADMIN_EMAIL="e2e-admin-$(date +%s)-$$.test@example.test"
# Register the admin candidate, then promote via psql (same approach as scripts/seed.sh).
curl -sf -X POST "http://127.0.0.1:$app_port/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"E2E Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"SyntheticE2E!1\"}" > /dev/null
psql "host=127.0.0.1 port=$test_port user=travelai_test dbname=travelai_test" -v ON_ERROR_STOP=1 \
  -c "update users set role='ADMIN' where email='$ADMIN_EMAIL'" > /dev/null

export E2E_BASE_URL="http://127.0.0.1:$app_port"
export E2E_ADMIN_EMAIL="$ADMIN_EMAIL"
export CHROMIUM_PATH="${CHROMIUM_PATH:-$HOME/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome}"

cd "$repo_root/apps/mobile"
node e2e/two-browser.mjs
