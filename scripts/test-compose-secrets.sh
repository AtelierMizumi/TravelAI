#!/usr/bin/env bash
# Regression test for the compose file's secret handling: the stack must refuse to render
# without a database password (no hard-coded default) and must render with one.
set -euo pipefail
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

render() { env -i PATH="$PATH" HOME="$HOME" "$@" docker compose --env-file /dev/null config 2>&1; }
fail=0

if out=$(render POSTGRES_PASSWORD=x); then
  echo "PASS compose renders when POSTGRES_PASSWORD is provided"
else
  echo "FAIL compose does not render with POSTGRES_PASSWORD: $out"; fail=1
fi

if out=$(render); then
  echo "FAIL compose rendered without POSTGRES_PASSWORD (a default password is hard-coded)"; fail=1
elif grep -q 'POSTGRES_PASSWORD' <<<"$out"; then
  echo "PASS compose refuses to render without POSTGRES_PASSWORD"
else
  echo "FAIL compose failed for another reason: $out"; fail=1
fi

exit $fail
