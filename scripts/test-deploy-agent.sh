#!/usr/bin/env bash
# Behaviour tests for scripts/deploy-agent.sh with stubbed docker/curl/git/smoke (no containers started).
set -uo pipefail
agent="$(cd "$(dirname "$0")" && pwd)/deploy-agent.sh"
[ -f "$agent" ] || { echo "FAIL  scripts/deploy-agent.sh is missing"; exit 1; }
fail=0
ok()  { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

new_env() {  # creates an isolated deploy dir with stubs; echoes its path
  local d; d=$(mktemp -d)
  mkdir -p "$d/bin" "$d/travelai"
  printf 'PUBLIC_ORIGIN=https://demo.example\n' > "$d/travelai/.env"
  cat > "$d/bin/curl" <<'STUB'
#!/usr/bin/env bash
printf '{"workflow_runs":[{"head_sha":"%s"}]}' "$(cat "$DEPLOY_DIR/fake.latest")"
STUB
  cat > "$d/bin/git" <<'STUB'
#!/usr/bin/env bash
echo "git $*" >> "$DEPLOY_DIR/calls.log"
STUB
  cat > "$d/bin/docker" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  *" pull"*)        echo "PULL tag=$TRAVELAI_TAG" >> "$DEPLOY_DIR/calls.log"; [ -e "$DEPLOY_DIR/fake.pullfail" ] && exit 1; exit 0 ;;
  *" ps -q"*)       echo fakecontainer ;;
  exec*)            echo "-- dump" ;;
  *" up "*)         echo "UP tag=$TRAVELAI_TAG" >> "$DEPLOY_DIR/calls.log"; echo "$TRAVELAI_TAG" > "$DEPLOY_DIR/running.tag" ;;
esac
STUB
  cat > "$d/bin/smoke" <<'STUB'
#!/usr/bin/env bash
echo "SMOKE running=$(cat "$DEPLOY_DIR/running.tag")" >> "$DEPLOY_DIR/calls.log"
grep -qxF "$(cat "$DEPLOY_DIR/running.tag")" "$DEPLOY_DIR/fake.badtags" 2>/dev/null && exit 1
exit 0
STUB
  chmod +x "$d"/bin/*
  : > "$d/fake.badtags"
  echo "$d"
}
run_agent() {  # $1=dir
  DEPLOY_DIR="$1" APP_DIR="$1/travelai" CURL="$1/bin/curl" GIT="$1/bin/git" DOCKER="$1/bin/docker" \
  SMOKE="$1/bin/smoke" NOTIFY=true SMOKE_RETRIES=2 SMOKE_WAIT=0 bash "$agent" >/dev/null 2>&1
}
SHA_A=aaaaaaaaaaaa1111111111111111111111111111; SHA_B=bbbbbbbbbbbb2222222222222222222222222222

# 1. nothing new -> no-op
d=$(new_env); echo "$SHA_A" > "$d/fake.latest"; mkdir -p "$d/state"; echo "$SHA_A" > "$d/state/current.sha"
run_agent "$d"
[ ! -s "$d/calls.log" ] && ok "same commit as deployed does nothing" || bad "same commit as deployed does nothing"

# 2. new commit, smoke passes -> deployed and recorded
d=$(new_env); echo "$SHA_B" > "$d/fake.latest"
run_agent "$d"
grep -q "UP tag=sha-bbbbbbbbbbbb" "$d/calls.log" && [ "$(cat "$d/state/current.sha")" = "$SHA_B" ] \
  && ok "healthy new commit is deployed and recorded" || bad "healthy new commit is deployed and recorded"
ls "$d"/backups/*.sql >/dev/null 2>&1 && ok "database backup taken before deploy" || bad "database backup taken before deploy"

# 3. new commit fails smoke -> rollback to previous tag, bad sha remembered, not retried
d=$(new_env); echo "$SHA_A" > "$d/state-seed" ; mkdir -p "$d/state"; echo "$SHA_A" > "$d/state/current.sha"; echo "sha-aaaaaaaaaaaa" > "$d/state/current.tag"
echo "$SHA_B" > "$d/fake.latest"; echo "sha-bbbbbbbbbbbb" > "$d/fake.badtags"
run_agent "$d"
ups=$(grep -c '^UP ' "$d/calls.log")
[ "$ups" = 2 ] && tail -n 3 "$d/calls.log" | grep -q "UP tag=sha-aaaaaaaaaaaa" && ok "failed smoke rolls back to the previous tag" || bad "failed smoke rolls back to the previous tag"
[ "$(cat "$d/state/current.sha")" = "$SHA_A" ] && [ "$(cat "$d/state/bad.sha")" = "$SHA_B" ] && ok "rollback keeps current and remembers the bad commit" || bad "rollback keeps current and remembers the bad commit"
: > "$d/calls.log"; run_agent "$d"
[ ! -s "$d/calls.log" ] && ok "a known-bad commit is not retried" || bad "a known-bad commit is not retried"

# 4. images not ready -> nothing changes, retried later
d=$(new_env); echo "$SHA_B" > "$d/fake.latest"; touch "$d/fake.pullfail"
run_agent "$d"
! grep -q '^UP ' "$d/calls.log" && [ ! -e "$d/state/current.sha" ] && [ ! -e "$d/state/bad.sha" ] && ok "missing images change nothing and are retried" || bad "missing images change nothing and are retried"

# 5. first deploy ever fails -> no rollback target, still marked bad
d=$(new_env); echo "$SHA_B" > "$d/fake.latest"; echo "sha-bbbbbbbbbbbb" > "$d/fake.badtags"
run_agent "$d"
[ "$(grep -c '^UP ' "$d/calls.log")" = 1 ] && [ "$(cat "$d/state/bad.sha")" = "$SHA_B" ] && ok "first deploy failure has no rollback and is marked bad" || bad "first deploy failure has no rollback and is marked bad"

# 6. history log records outcomes
grep -q "FAILED" "$d/history.log" && ok "history log records the failure" || bad "history log records the failure"
exit $fail
