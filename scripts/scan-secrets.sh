#!/usr/bin/env bash
# Fail if a tracked file looks like it contains a secret or is a document binary.
# Prints file:line only, never the matched text. Paths listed in .secretscan-allow
# (one per line, relative to the repo root) are skipped, e.g. synthetic test fixtures.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

PATTERNS=(
  '-----BEGIN ([A-Z]+ )?PRIVATE KEY-----'
  '"private_key_id"[[:space:]]*:'
  'AIza[0-9A-Za-z_-]{35}'
  'gh[pousr]_[A-Za-z0-9]{36,}'
  'eyJhIjoi[A-Za-z0-9+/=]{40,}'
  'sk-ant-[A-Za-z0-9_-]{20,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
)
SELF=(scripts/scan-secrets.sh scripts/test-scan-secrets.sh)

skip=("${SELF[@]}")
[ -f .secretscan-allow ] && while IFS= read -r line; do [ -n "$line" ] && skip+=("$line"); done < .secretscan-allow

is_skipped() { local f=$1 s; for s in "${skip[@]}"; do [ "$f" = "$s" ] && return 0; done; return 1; }

status=0
while IFS= read -r file; do
  is_skipped "$file" && continue
  case "$file" in
    *.docx|*.pdf|*.xlsx|*.pptx|*.zip) echo "forbidden document binary tracked: $file"; status=1; continue ;;
  esac
  [ -f "$file" ] || continue
  for pattern in "${PATTERNS[@]}"; do
    while IFS=: read -r line _; do
      echo "possible secret: $file:$line"; status=1
    done < <(grep -InE -e "$pattern" -- "$file" 2>/dev/null || true)
  done
done < <(git ls-files)
[ "$status" -eq 0 ] && echo "no secrets found"
exit "$status"
