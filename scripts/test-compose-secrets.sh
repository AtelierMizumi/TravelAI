#!/usr/bin/env bash
# Regression test for A1/A2 on the shared compose file: the legacy core
# backend must receive JWT_SECRET, while the v2 profile (prod, CI) must keep
# rendering without it. Compose interpolates the whole file, so a `:?` guard
# here would break v2; the core service fails fast on a blank secret instead
# (JwtSecretRequiredTest).
set -euo pipefail
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$repo_root"

render() { env -i PATH="$PATH" HOME="$HOME" "$@" docker compose --env-file /dev/null --profile v2 config 2>&1; }
fail=0

out=$(render POSTGRES_PASSWORD=x JWT_SECRET=synthetic-test-secret) || { echo "FAIL render with secret: $out"; exit 1; }
if grep -q 'JWT_SECRET: synthetic-test-secret' <<<"$out"; then
  echo "PASS legacy backend receives JWT_SECRET"
else
  echo "FAIL legacy backend environment has no JWT_SECRET"; fail=1
fi

if out=$(render POSTGRES_PASSWORD=x); then
  echo "PASS v2 profile renders without JWT_SECRET"
else
  echo "FAIL v2 profile no longer renders without JWT_SECRET: $out"; fail=1
fi

exit $fail
