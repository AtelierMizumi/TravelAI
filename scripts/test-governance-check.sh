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
mkdir -p ai-service apps/mobile backend/src/main/java/x scripts
cp "$CHECK" scripts/governance-check.sh
chmod +x scripts/governance-check.sh
CHECK_SRC="$CHECK"
CHECK=scripts/governance-check.sh
echo "x = 1" > ai-service/app.py
echo '{"name":"x"}' > apps/mobile/package.json
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
echo 'KEY = "AKIAIOSFODNN7EXAMPLE"' > ai-service/app.py
git add ai-service/app.py
if "$CHECK" >/dev/null 2>&1; then bad "AWS key should fail"; else ok "AWS key fails check"; fi
git checkout -q -- ai-service/app.py

# Violation 3: bad commit message (no type/scope/issue)
echo "y = 2" >> ai-service/app.py
git add ai-service/app.py
git commit -qm "random message"
if "$CHECK" "$BASE" >/dev/null 2>&1; then bad "bad commit message should fail"; else ok "bad commit message fails check"; fi

# Violation 4: assistant attribution trailer
echo "z = 3" >> ai-service/app.py
git add ai-service/app.py
git commit -qm "feat(ai): add z (#1)" -m "Co-Authored-By: Bot <bot@example.com>"
if "$CHECK" "$BASE" >/dev/null 2>&1; then bad "Co-Authored-By trailer should fail"; else ok "Co-Authored-By trailer fails check"; fi

# Violation 5: absolute local path in source
echo 'p = "/home/thuanc177/Projects/x"' > ai-service/app.py
git add ai-service/app.py
if "$CHECK" >/dev/null 2>&1; then bad "absolute path should fail"; else ok "absolute path fails check"; fi

# Layout regression: the test-first heuristic must follow the real monorepo layout
# (backend/, ai-service/, apps/mobile/), not the retired services/ and client/ folders.
BASE2="$(git rev-parse HEAD)"
echo "z = 9" > ai-service/app.py && git add ai-service/app.py && git commit -qm "feat(ai): tweak (#2)"
if "$CHECK" "$BASE2" >/dev/null 2>&1; then bad "ai-service change without tests should fail test-first"; else ok "ai-service change without tests fails test-first"; fi
BASE3="$(git rev-parse HEAD)"
mkdir -p backend/src/main/java/x && echo "w = 1" > backend/src/main/java/x/Svc.java
git add backend && git commit -qm "feat(be): svc (#3)"
if "$CHECK" "$BASE3" >/dev/null 2>&1; then bad "backend change without tests should fail test-first"; else ok "backend change without tests fails test-first"; fi
mkdir -p backend/src/test/java/x && echo "t = 1" > backend/src/test/java/x/SvcTest.java
git add backend && git commit -qm "test(be): svc test (#3)"
if "$CHECK" "$BASE3" >/dev/null 2>&1; then ok "backend change with test change passes test-first"; else bad "backend change with test change should pass test-first"; fi

# False-positive guard: the secret-scan self-test fixture and .env.example placeholders
# are intentional and must not block the gate.
TMP2="$(mktemp -d)"
(
  cd "$TMP2" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts && cp "$CHECK_SRC" scripts/governance-check.sh
  printf -- '-----BEGIN PRIVATE %s-----\nabc\n' KEY > scripts/test-scan-secrets.sh
  printf '# key file, e.g. /home/you/secrets/sa.json\n' > .env.example
  git add -A
  bash scripts/governance-check.sh >/dev/null 2>&1
) && ok "fixture and .env.example placeholders are not flagged" || bad "fixture and .env.example placeholders should not be flagged"
rm -rf "$TMP2"

# TC-11: a tracked local_references/ file must fail the quarantine check.
TMP3="$(mktemp -d)"
(
  cd "$TMP3" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts local_references && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "legacy" > local_references/note.md && git add -A
  out="$(bash scripts/governance-check.sh 2>&1)"; rc=$?
  [[ $rc -ne 0 ]] && grep -q "local_references tracked" <<<"$out"
) && ok "TC-11 tracked local_references/ fails with the quarantine message" || bad "TC-11 tracked local_references/ should fail"
rm -rf "$TMP3"

# TC-12: without a base ref the history-based checks must SKIP, not FAIL.
TMP4="$(mktemp -d)"
(
  cd "$TMP4" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts ai-service && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "x = 1" > ai-service/app.py && git add -A && git commit -qm "random message"
  out="$(bash scripts/governance-check.sh 2>&1)"; rc=$?
  [[ $rc -eq 0 ]] && grep -q "SKIP  TAGF-4" <<<"$out" && grep -q "SKIP  test-first" <<<"$out"
) && ok "TC-12 no base ref: commit and test-first checks SKIP, exit 0" || bad "TC-12 no base ref should SKIP and exit 0"
rm -rf "$TMP4"

# TC-13: a change under apps/mobile/src without a test must fail test-first.
TMP5="$(mktemp -d)"
(
  cd "$TMP5" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts apps/mobile/src && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "export const a = 1;" > apps/mobile/src/a.tsx && git add -A && git commit -qm "feat(app): base (#1)"
  BASE5="$(git rev-parse HEAD)"
  echo "export const b = 2;" > apps/mobile/src/b.tsx && git add -A && git commit -qm "feat(app): add b (#2)"
  out="$(bash scripts/governance-check.sh "$BASE5" 2>&1)"; rc=$?
  [[ $rc -ne 0 ]] && grep -q "test-first" <<<"$out"
) && ok "TC-13 apps/mobile/src change without test fails test-first" || bad "TC-13 apps/mobile/src change without test should fail"
rm -rf "$TMP5"

# TC-02 (extended, FR-001): every office/binary extension in the requirement must be blocked.
for ext in pdf xlsx pptx csv ods; do
  TMP6="$(mktemp -d)"
  (
    cd "$TMP6" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
    mkdir -p scripts && cp "$CHECK_SRC" scripts/governance-check.sh
    printf 'fake' > "report.$ext" && git add -A
    out="$(bash scripts/governance-check.sh 2>&1)"; rc=$?
    [[ $rc -ne 0 ]] && grep -q "forbidden tracked" <<<"$out" || grep -q "TAGF-1 forbidden" <<<"$out"
  ) && ok "TC-02 tracked .$ext fails check" || bad "TC-02 tracked .$ext should fail"
  rm -rf "$TMP6"
done

# TC-14 (edge case, FR-005): a change inside ai-service/tests/ is a test change and needs no extra test.
TMP7="$(mktemp -d)"
(
  cd "$TMP7" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts ai-service/tests && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "a = 1" > ai-service/tests/test_a.py && git add -A && git commit -qm "test(ai): base (#1)"
  BASE7="$(git rev-parse HEAD)"
  echo "a = 2" > ai-service/tests/test_a.py && git add -A && git commit -qm "test(ai): tweak (#2)"
  out="$(bash scripts/governance-check.sh "$BASE7" 2>&1)"; rc=$?
  [[ $rc -eq 0 ]] && grep -q "test-first: source changes include test changes" <<<"$out"
) && ok "TC-14 ai-service/tests-only change passes test-first" || bad "TC-14 ai-service/tests-only change should pass"
rm -rf "$TMP7"

# TC-15 (FR-007): the harness must run with only core tools on PATH (no docker, curl, wget).
# Guard: when this check itself is running, skip it to avoid recursion.
if [[ -z "${GOV_TC15_NESTED:-}" ]]; then
  MINBIN="$(mktemp -d)"
  for t in bash git grep sed mktemp cp mkdir rm dirname chmod cat printf echo tr head sort wc cut awk env; do
    src="$(command -v "$t" 2>/dev/null)" && ln -s "$src" "$MINBIN/$t"
  done
  # The property under test is "no missing tool", not "every case passes": the nested run must
  # reach its summary line and must not report a missing command.
  nested_out="$(env -i PATH="$MINBIN" GOV_TC15_NESTED=1 HOME="$HOME" bash "$ROOT/scripts/test-governance-check.sh" 2>&1)"
  if grep -q "^PASS=" <<<"$nested_out" && ! grep -qi "command not found" <<<"$nested_out"; then
    ok "TC-15 harness runs to completion with core tools only (FR-007)"
  else
    bad "TC-15 harness could not run with core tools only"
  fi
  rm -rf "$MINBIN"
fi

# TC-16 (FR-002, Constitution 1): the gate must print file:line only, never the secret text.
TMP8="$(mktemp -d)"
(
  cd "$TMP8" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts && cp "$CHECK_SRC" scripts/governance-check.sh
  echo 'KEY = "AKIAIOSFODNN7EXAMPLE"' > app.txt && git add -A
  out="$(bash scripts/governance-check.sh 2>&1)"
  grep -q "app.txt:1" <<<"$out" && ! grep -q "AKIAIOSFODNN7EXAMPLE" <<<"$out"
) && ok "TC-16 secret finding prints file:line without the secret text" || bad "TC-16 secret finding must not print the secret text"
rm -rf "$TMP8"

# TC-17 (FR-005): a source file whose name merely contains "spec" or "test" needs a real test change.
TMP9="$(mktemp -d)"
(
  cd "$TMP9" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts backend/src/main/java/x ai-service && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "class A {}" > backend/src/main/java/x/Base.java && git add -A && git commit -qm "feat(be): base (#1)"
  BASE9="$(git rev-parse HEAD)"
  echo "class B {}" > backend/src/main/java/x/InspectionService.java
  echo "x = 1" > ai-service/contest.py
  git add -A && git commit -qm "feat(be): inspection (#2)"
  out="$(bash scripts/governance-check.sh "$BASE9" 2>&1)"; rc=$?
  [[ $rc -ne 0 ]] && grep -q "test-first" <<<"$out" && grep -q "FAIL  test-first" <<<"$out"
) && ok "TC-17 source files with 'spec'/'test' in the name still need a real test" || bad "TC-17 InspectionService.java / contest.py must fail test-first without a real test"
rm -rf "$TMP9"

# TC-18 (FR-005): a non-test file that only contains "test" in its name is not a test change.
TMP10="$(mktemp -d)"
(
  cd "$TMP10" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts apps/mobile/src docs && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "export const a = 1;" > apps/mobile/src/a.tsx && git add -A && git commit -qm "feat(app): base (#1)"
  BASE10="$(git rev-parse HEAD)"
  echo "export const b = 2;" > apps/mobile/src/b.tsx && echo "notes" > docs/contest-notes.md
  git add -A && git commit -qm "feat(app): add b (#2)"
  out="$(bash scripts/governance-check.sh "$BASE10" 2>&1)"; rc=$?
  [[ $rc -ne 0 ]] && grep -q "FAIL  test-first" <<<"$out"
) && ok "TC-18 'contest-notes.md' is not counted as a test change" || bad "TC-18 a non-test file containing 'test' must not satisfy test-first"
rm -rf "$TMP10"

# TC-19 (FR-005): genuine tests recognised by name pattern satisfy test-first.
TMP11="$(mktemp -d)"
(
  cd "$TMP11" && git init -q && git config user.email t@example.com && git config user.name T && git config commit.gpgsign false
  mkdir -p scripts apps/mobile/src && cp "$CHECK_SRC" scripts/governance-check.sh
  echo "export const a = 1;" > apps/mobile/src/a.tsx && git add -A && git commit -qm "feat(app): base (#1)"
  BASE11="$(git rev-parse HEAD)"
  echo "export const b = 2;" > apps/mobile/src/b.tsx && echo "it('b', () => {});" > apps/mobile/src/b.test.tsx
  git add -A && git commit -qm "feat(app): add b (#2)"
  out="$(bash scripts/governance-check.sh "$BASE11" 2>&1)"; rc=$?
  [[ $rc -eq 0 ]] && grep -q "PASS  test-first" <<<"$out"
) && ok "TC-19 real test file (*.test.tsx) satisfies test-first" || bad "TC-19 real *.test.tsx change should pass test-first"
rm -rf "$TMP11"

echo
echo "PASS=$PASS FAIL=$FAIL"
[[ "$FAIL" -eq 0 ]]
