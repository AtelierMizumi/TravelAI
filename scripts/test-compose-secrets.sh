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

# Password-reset mail: SMTP settings and the reset secret must reach the backend container,
# and the defaults must point at Resend (user "resend", STARTTLS 587).
cfg=$(render POSTGRES_PASSWORD=x TRAVELAI_SMTP_PASSWORD=pw TRAVELAI_RESET_SECRET=rs TRAVELAI_SMTP_FROM='TravelAI <no-reply@example.test>') || cfg=""
for want in 'TRAVELAI_SMTP_HOST: smtp.resend.com' 'TRAVELAI_SMTP_PORT: "587"' 'TRAVELAI_SMTP_USERNAME: resend' 'TRAVELAI_SMTP_PASSWORD: pw' 'TRAVELAI_RESET_SECRET: rs' 'TRAVELAI_SMTP_FROM: TravelAI <no-reply@example.test>'; do
  if grep -qF "$want" <<<"$cfg"; then echo "PASS backend receives $want"; else echo "FAIL backend does not receive $want"; fail=1; fi
done

exit $fail
