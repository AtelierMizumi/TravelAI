#!/usr/bin/env bash
# Regression test for A1/A2: the core backend must receive JWT_SECRET from
# the environment, and compose must refuse to render without it.
set -euo pipefail
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

fail=0
check() { # name, expected (ok|fail), env...
  local name=$1 expected=$2; shift 2
  local out status=0
  out=$(env -i PATH="$PATH" HOME="$HOME" "$@" docker compose --env-file /dev/null config 2>&1) || status=$?
  if [[ $expected == ok && $status -ne 0 ]]; then
    echo "FAIL $name: expected success, got exit $status"; fail=1; return
  fi
  if [[ $expected == fail && $status -eq 0 ]]; then
    echo "FAIL $name: expected compose to refuse, it rendered"; fail=1; return
  fi
  if [[ $expected == ok ]] && ! grep -q 'JWT_SECRET: synthetic-test-secret' <<<"$out"; then
    echo "FAIL $name: backend environment has no JWT_SECRET"; fail=1; return
  fi
  echo "PASS $name"
}

check "secret set is passed to backend" ok POSTGRES_PASSWORD=x JWT_SECRET=synthetic-test-secret
check "blank secret is refused" fail POSTGRES_PASSWORD=x JWT_SECRET=
check "missing secret is refused" fail POSTGRES_PASSWORD=x

exit $fail
