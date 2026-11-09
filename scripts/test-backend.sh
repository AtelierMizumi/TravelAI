#!/usr/bin/env bash
set -euo pipefail
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_root=$(mktemp -d /tmp/travelai-backend-test-XXXXXX)
test_port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
cleanup() {
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
# JDK 21 is the available compatible annotation-processing test runtime.
# The production pom retains its Java 25 release default.
if [[ -d /usr/lib/jvm/java-21-openjdk ]]; then
  export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
fi
printf 'Isolated test evidence directory: %s\n' "$test_root"
cd "$repo_root/backend"
mvn -o -Djava.version=21 -Dtravelai.build.directory="$test_root/build" "$@" test
