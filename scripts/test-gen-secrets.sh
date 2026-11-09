#!/usr/bin/env bash
# Behaviour test for scripts/gen-secrets.sh, run in a throwaway directory.
set -euo pipefail
script="$(cd "$(dirname "$0")" && pwd)/gen-secrets.sh"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cd "$tmp"; fail=0
ok()  { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

out1=$(bash "$script" 2>&1) || bad "first run exits 0"
[ -s secrets/message.key ] && ok "message.key created" || bad "message.key created"
[ "$(stat -c %a secrets/message.key)" = 600 ] && ok "message.key mode 600" || bad "message.key mode 600"
[ "$(base64 -d < secrets/message.key | wc -c)" = 32 ] && ok "message.key is 32 random bytes" || bad "message.key is 32 random bytes"
pw=$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)
[ "${#pw}" -ge 32 ] && ok "POSTGRES_PASSWORD >= 32 chars" || bad "POSTGRES_PASSWORD >= 32 chars"
grep -q "^HOST_MESSAGE_KEY=$tmp/secrets/message.key$" .env && ok "HOST_MESSAGE_KEY points at secrets/message.key" || bad "HOST_MESSAGE_KEY points at secrets/message.key"
[ "$(stat -c %a .env)" = 600 ] && ok ".env mode 600" || bad ".env mode 600"

key1=$(cat secrets/message.key); env1=$(cat .env)
out2=$(bash "$script" 2>&1) || bad "second run exits 0"
[ "$key1" = "$(cat secrets/message.key)" ] && [ "$env1" = "$(cat .env)" ] && ok "second run changes nothing" || bad "second run changes nothing"
if printf '%s%s' "$out1" "$out2" | grep -qF -e "$pw" -e "$key1"; then bad "no secret printed"; else ok "no secret printed"; fi
exit $fail
