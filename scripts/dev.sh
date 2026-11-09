#!/usr/bin/env bash
set -euo pipefail

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
mode=${1:-app}
expo_port=${EXPO_PORT:-8084}
log_dir=${TRAVELAI_LOG_DIR:-"${TMPDIR:-/tmp}/travelai-dev-$(id -u)"}
mkdir -p "$log_dir"
chmod 700 "$log_dir"
started=()

cleanup() {
  for process_id in "${started[@]}"; do
    kill -TERM -- "-$process_id" 2>/dev/null || true
  done
}
trap cleanup EXIT
trap 'exit 130' INT TERM

port_open() {
  python3 - "$1" <<'PY'
import socket, sys
with socket.socket() as sock:
    sock.settimeout(0.5)
    raise SystemExit(sock.connect_ex(('127.0.0.1', int(sys.argv[1]))) != 0)
PY
}
wait_for_url() {
  local address=$1 label=$2 process_id=$3
  for _ in {1..60}; do
    if curl -fsS --max-time 1 "$address" >/dev/null 2>&1; then return 0; fi
    if ! kill -0 "$process_id" 2>/dev/null; then
      printf '%s không khởi động được. Xem log trong %s.\n' "$label" "$log_dir" >&2
      return 1
    fi
    sleep 1
  done
  printf '%s khởi động quá lâu. Xem log trong %s.\n' "$label" "$log_dir" >&2
  return 1
}

if [[ "$mode" != app && "$mode" != web ]]; then
  printf 'Sử dụng: scripts/dev.sh [app|web]\n' >&2
  exit 2
fi
if ! pg_isready -q -h 127.0.0.1 -p 5432; then
  printf 'PostgreSQL chưa sẵn sàng tại 127.0.0.1:5432.\n' >&2
  exit 1
fi
if port_open 8080; then
  curl -fsS --max-time 2 http://127.0.0.1:8080/api/places >/dev/null || { printf 'Cổng 8080 đang dùng bởi dịch vụ khác.\n' >&2; exit 1; }
  printf 'Đang dùng backend ở cổng 8080.\n'
else
  key_file=${TRAVELAI_MESSAGE_KEY_FILE:-"$project_root/backend/.secrets/message.key"}
  if [[ ! -r "$key_file" ]]; then
    printf 'Thiếu khóa mã hóa tin nhắn. Xem README trước khi khởi động.\n' >&2
    exit 1
  fi
  export TRAVELAI_MESSAGE_KEY_FILE="$key_file"
  java_cmd=${JAVA_HOME:+"$JAVA_HOME/bin/"}java
  java_version=$("$java_cmd" -version 2>&1 | sed -n '1s/.*version "\([0-9]*\).*/\1/p')
  maven_args=()
  if [[ "$java_version" == 21 ]]; then maven_args=(-Djava.version=21); fi
  if [[ ${java_version:-0} -ge 26 && -x /usr/lib/jvm/java-21-openjdk/bin/java ]]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
    java_version=21
    maven_args=(-Djava.version=21)
  fi
  # A build from another JDK can otherwise be reused even when it is too new
  # for the selected runtime. Keep each runtime's compiler output separate.
  maven_args+=("-Dtravelai.build.directory=$log_dir/backend-build-java-${java_version:-unknown}")
  printf 'Đang khởi động backend…\n'
  setsid bash -c 'cd "$1"; shift; export SPRING_JPA_SHOW_SQL=false; exec mvn "$@" spring-boot:run' _ "$project_root/backend" "${maven_args[@]}" >"$log_dir/backend.log" 2>&1 &
  backend_pid=$!
  started+=("$backend_pid")
  wait_for_url http://127.0.0.1:8080/api/places Backend "$backend_pid"
fi
# These credentials are needed only by the backend, never the AI or Expo process.
unset TRAVELAI_SMTP_USERNAME TRAVELAI_SMTP_PASSWORD TRAVELAI_SMTP_FROM TRAVELAI_RESET_SECRET
if port_open 8000; then
  curl -fsS --max-time 2 http://127.0.0.1:8000/ >/dev/null || { printf 'Cổng 8000 đang dùng bởi dịch vụ khác.\n' >&2; exit 1; }
  printf 'Đang dùng AI service ở cổng 8000.\n'
else
  printf 'Đang khởi động AI service…\n'
  setsid python3 -m uvicorn ai.main:app --app-dir "$project_root/ai-service" --host 0.0.0.0 --port 8000 >"$log_dir/ai-service.log" 2>&1 &
  ai_pid=$!
  started+=("$ai_pid")
  wait_for_url http://127.0.0.1:8000/ 'AI service' "$ai_pid"
fi
if port_open "$expo_port"; then
  printf 'Cổng Expo %s đang được sử dụng. Đặt EXPO_PORT sang cổng khác.\n' "$expo_port" >&2
  exit 1
fi
printf 'Backend: http://localhost:8080 · AI: http://localhost:8000 · Expo: http://localhost:%s\n' "$expo_port"
printf 'Dừng bằng Ctrl+C. Log dịch vụ tại %s.\n' "$log_dir"
cd "$project_root/apps/mobile"
if [[ "$mode" == web ]]; then
  ./node_modules/.bin/expo start --web --port "$expo_port"
else
  ./node_modules/.bin/expo start --port "$expo_port"
fi
