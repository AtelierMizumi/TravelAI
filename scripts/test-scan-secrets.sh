#!/usr/bin/env bash
# Behaviour test for scripts/scan-secrets.sh using throwaway git repositories.
set -uo pipefail
script="$(cd "$(dirname "$0")" && pwd)/scan-secrets.sh"
fail=0
[ -f "$script" ] || { echo "FAIL  scripts/scan-secrets.sh is missing"; exit 1; }
ok()  { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

repo() { local d; d=$(mktemp -d); git -C "$d" init -q; git -C "$d" config user.email t@example.test; git -C "$d" config user.name t; echo "$d"; }
scan() { (cd "$1" && git add -A && bash "$script" >/dev/null 2>&1); }

clean=$(repo); echo 'hello' > "$clean/readme.md"
scan "$clean" && ok "clean repo passes" || bad "clean repo passes"

for name in pem gcp aiza ghp tunnel; do
  d=$(repo)
  case $name in
    pem)    printf -- '-----BEGIN PRIVATE KEY-----\nabc\n' > "$d/k.txt" ;;
    gcp)    printf '{"type":"service_account","private_key_id":"0123456789abcdef"}\n' > "$d/sa.json" ;;
    aiza)   printf 'key=AIza%s\n' "$(printf 'A%.0s' {1..35})" > "$d/c.txt" ;;
    ghp)    printf 'token=ghp_%s\n' "$(printf 'a%.0s' {1..36})" > "$d/t.txt" ;;
    tunnel) printf 'TUNNEL=eyJhIjoi%s\n' "$(printf 'B%.0s' {1..60})" > "$d/e.txt" ;;
  esac
  scan "$d" && bad "detects $name" || ok "detects $name"
  rm -rf "$d"
done

allowed=$(repo); printf 'AIza%s\n' "$(printf 'A%.0s' {1..35})" > "$allowed/fixture.txt"
printf 'fixture.txt\n' > "$allowed/.secretscan-allow"
scan "$allowed" && ok "allowlisted file passes" || bad "allowlisted file passes"
rm -rf "$clean" "$allowed"
exit $fail
