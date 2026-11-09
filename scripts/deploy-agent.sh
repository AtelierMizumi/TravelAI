#!/usr/bin/env bash
# Pull-based deploy agent. Runs on the production PC (systemd timer); nothing connects to the PC.
#  1. ask GitHub for the newest commit of $DEPLOY_REF whose CI run (including image publishing) succeeded
#  2. if it is new: check out that commit, pull its images, back up the database, start it, smoke-test it
#  3. smoke fails -> restart the previous version, remember the bad commit so it is not retried
# State lives in $DEPLOY_DIR/state, log in $DEPLOY_DIR/history.log. Needs no credentials (public repo and images).
set -uo pipefail
umask 077   # state, logs and database dumps are private to this user

DEPLOY_DIR="${DEPLOY_DIR:-$HOME/deploy}"
[ -f "$DEPLOY_DIR/agent.env" ] && . "$DEPLOY_DIR/agent.env"
REPO="${REPO:-AtelierMizumi/TravelAI}"
REF="${DEPLOY_REF:-main}"
APP_DIR="${APP_DIR:-$DEPLOY_DIR/travelai}"
CURL="${CURL:-curl}"; GIT="${GIT:-git}"; DOCKER="${DOCKER:-docker}"
SMOKE="${SMOKE:-bash scripts/smoke-edge.sh}"
NOTIFY="${NOTIFY:-notify-send}"
SMOKE_RETRIES="${SMOKE_RETRIES:-4}"; SMOKE_WAIT="${SMOKE_WAIT:-15}"
SERVICES=(postgres-v2 ai-v2 backend-v2 caddy cloudflared)
STATE="$DEPLOY_DIR/state"; LOG="$DEPLOY_DIR/history.log"
mkdir -p "$STATE" "$DEPLOY_DIR/backups"
chmod 700 "$DEPLOY_DIR/backups"

log() { printf '%s %s\n' "$(date -Is)" "$*" >> "$LOG"; echo "$*"; }
notify() { "$NOTIFY" "TravelAI deploy" "$1" >/dev/null 2>&1 || true; }

exec 9> "$DEPLOY_DIR/agent.lock"
flock -n 9 || exit 0

compose() { # $1=image tag, rest=compose args
  local tag=$1; shift
  (cd "$APP_DIR" && COMPOSE_PROJECT_NAME=travelai-prod TRAVELAI_TAG="$tag" "$DOCKER" compose --profile v2 \
     -f docker-compose.yml -f docker-compose.edge.yml -f docker-compose.release.yml "$@")
}
origin() { grep '^PUBLIC_ORIGIN=' "$APP_DIR/.env" | cut -d= -f2-; }
smoke() {
  local i
  for ((i = 1; i <= SMOKE_RETRIES; i++)); do
    (cd "$APP_DIR" && SEEDED=1 $SMOKE "$(origin)") >/dev/null 2>&1 && return 0
    sleep "$SMOKE_WAIT"
  done
  return 1
}

latest=$("$CURL" -fsS --max-time 20 \
  "https://api.github.com/repos/$REPO/actions/workflows/ci.yml/runs?branch=$REF&event=push&status=success&per_page=1" 2>/dev/null \
  | python3 -c 'import sys,json; r=json.load(sys.stdin).get("workflow_runs") or []; print(r[0]["head_sha"] if r else "")' 2>/dev/null)
[ -n "$latest" ] || exit 0

current=$(cat "$STATE/current.sha" 2>/dev/null || true)
bad=$(cat "$STATE/bad.sha" 2>/dev/null || true)
{ [ "$latest" = "$current" ] || [ "$latest" = "$bad" ]; } && exit 0

tag="sha-${latest:0:12}"
previous_tag=$(cat "$STATE/current.tag" 2>/dev/null || true)

"$GIT" -C "$APP_DIR" fetch --quiet origin >/dev/null 2>&1
"$GIT" -C "$APP_DIR" checkout --quiet --detach "$latest" >/dev/null 2>&1

if ! compose "$tag" pull --quiet >/dev/null 2>&1; then
  log "images for $tag are not available yet: will retry"
  exit 0
fi

# Refuse images that were not built from exactly this commit (stale or re-pushed tag).
while read -r image; do
  revision=$("$DOCKER" inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' "$image" 2>/dev/null)
  if [ "$revision" != "$latest" ]; then
    echo "$latest" > "$STATE/bad.sha"
    log "REFUSED $tag: $image was not built from $latest"
    notify "Refused deploy of $tag: image revision mismatch"
    exit 1
  fi
done < <(compose "$tag" config --images 2>/dev/null | grep '^ghcr.io/ateliermizumi/travelai-')

db=$(compose "$tag" ps -q postgres-v2 2>/dev/null | head -n1)
if [ -n "$db" ]; then
  "$DOCKER" exec "$db" pg_dump -U travelai_user travel_ai > "$DEPLOY_DIR/backups/before-$tag.sql" 2>/dev/null
  # keep the 10 newest backups; only files inside our own backups directory are touched
  ls -1t "$DEPLOY_DIR"/backups/before-*.sql 2>/dev/null | tail -n +11 | while read -r old; do rm -f -- "$old"; done
fi

log "deploying $tag ($latest)"
compose "$tag" up -d --no-build --wait "${SERVICES[@]}" >/dev/null 2>&1
if smoke; then
  echo "$latest" > "$STATE/current.sha"; echo "$tag" > "$STATE/current.tag"
  log "DEPLOYED $tag"
  exit 0
fi

echo "$latest" > "$STATE/bad.sha"
log "FAILED smoke test for $tag"
if [ -n "$previous_tag" ]; then
  log "rolling back to $previous_tag"
  compose "$previous_tag" up -d --no-build --wait "${SERVICES[@]}" >/dev/null 2>&1
  if smoke; then log "ROLLED BACK to $previous_tag"; else log "ROLLBACK ALSO FAILED: manual action needed"; fi
else
  log "no previous version to roll back to: manual action needed"
fi
notify "Deploy of $tag failed; see $LOG"
exit 1
