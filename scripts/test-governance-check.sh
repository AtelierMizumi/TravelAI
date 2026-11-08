#!/usr/bin/env bash
# Test-first harness for scripts/governance-check.sh
# RED: governance script missing or passes on a repo that violates TAGF.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHECK="$ROOT/scripts/governance-check.sh"
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "ok   - $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL - $1"; }

if [[ ! -x "$CHECK" ]]; then
  echo "FAIL - governance-check.sh does not exist yet (RED)"
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cd "$TMP"
git init -q
git config user.email "test@example.com"
git config user.name "Test"
git config commit.gpgsign false
mkdir -p services/ai client scripts
cp "$CHECK" scripts/governance-check.sh
chmod +x scripts/governance-check.sh
CHECK=scripts/governance-check.sh
echo "x = 1" > services/ai/app.py
echo '{"name":"x"}' > client/package.json
git add -A
git commit -qm "feat(ai): add app (#1)"
BASE=$(git rev-parse HEAD)
if "$CHECK" "$BASE" >/dev/null 2>&1; then ok "clean repo passes"; else bad "clean repo should pass"; fi

# Violation 1: tracked office binary
printf 'PK fake' > report.docx
git add report.docx
if "$CHECK" >/dev/null 2>&1; then bad "tracked .docx should fail"; else ok "tracked .docx fails check"; fi
git reset -q HEAD report.docx; rm -f report.docx

# Violation 2: secret in tracked file
echo 'KEY = "AKIAIOSFODNN7EXAMPLE"' > services/ai/app.py
git add services/ai/app.py
if "$CHECK" >/dev/null 2>&1; then bad "AWS key should fail"; else ok "AWS key fails check"; fi
git checkout -q -- services/ai/app.py

# Violation 3: bad commit message (no type/scope/issue)
echo "y = 2" >> services/ai/app.py
git add services/ai/app.py
git commit -qm "random message"
if "$CHECK" "$BASE" >/dev/null 2>&1; then bad "bad commit message should fail"; else ok "bad commit message fails check"; fi

# Violation 4: assistant attribution trailer
echo "z = 3" >> services/ai/app.py
git add services/ai/app.py
git commit -qm "feat(ai): add z (#1)" -m "Co-Authored-By: Bot <bot@example.com>"
if "$CHECK" "$BASE" >/dev/null 2>&1; then bad "Co-Authored-By trailer should fail"; else ok "Co-Authored-By trailer fails check"; fi

# Violation 5: absolute local path in source
echo 'p = "/home/thuanc177/Projects/x"' > services/ai/app.py
git add services/ai/app.py
if "$CHECK" >/dev/null 2>&1; then bad "absolute path should fail"; else ok "absolute path fails check"; fi

echo
echo "PASS=$PASS FAIL=$FAIL"
[[ "$FAIL" -eq 0 ]]
