#!/usr/bin/env bash
# TravelAI governance CI checkpoint — enforces TAGF-v2.0 invariants that are
# machine-checkable. Each check maps to a rule in AGENTS.md / .agents/rules/.
# Usage: scripts/governance-check.sh [base-ref]
#   base-ref: optional git ref for the test-first heuristic (PR diff).
# Exit 0 = all checkpoints pass, 1 = at least one violation.
set -u
cd "$(dirname "$0")/.."
FAIL=0
pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1 — $2"; FAIL=1; }

# TAGF 1: no tracked office/binary documents
BAD=$(git ls-files | grep -iE '\.(docx|doc|xlsx|xls|ods|odt|pdf|pptx|ppt|csv)$' || true)
if [[ -n "$BAD" ]]; then fail "TAGF-1 forbidden tracked files" "$BAD"; else pass "TAGF-1 no tracked office/binary files"; fi

# TAGF 1: local_references quarantine (never tracked)
BAD=$(git ls-files | grep -E '^(local_references/|local_references\.zip)' || true)
if [[ -n "$BAD" ]]; then fail "TAGF-1 local_references tracked" "$BAD"; else pass "TAGF-1 local_references not tracked"; fi

# TAGF 1/2: no secrets in tracked files (placeholders in .env.example excluded;
# the self-test harness is excluded because it deliberately generates fake
# secret/path fixtures to prove detection works)
BAD=$(git grep -n -iE 'AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}' -- . ':!.env.example' ':!scripts/test-governance-check.sh' 2>/dev/null || true)
if [[ -n "$BAD" ]]; then fail "TAGF-1/2 secret material in tracked files" "$BAD"; else pass "TAGF-1/2 no secret patterns in tracked files"; fi

# TAGF 2: no absolute local paths in tracked source
BAD=$(git grep -n -E '/home/[A-Za-z0-9_.-]+/|/Users/[A-Za-z0-9_.-]+/|C:\\Users\\' -- . ':!AGENTS.md' ':!.agents' ':!scripts/test-governance-check.sh' ':!docs/governance-ci.md' 2>/dev/null || true)
if [[ -n "$BAD" ]]; then fail "TAGF-2 absolute local path in source" "$BAD"; else pass "TAGF-2 no absolute local paths"; fi

# TAGF 4: Conventional Commits + no assistant trailers — only commits in
# base...HEAD (PR gate); without a base, history is not gated (SKIP).
BASE="${1:-${BASE_REF:-}}"
if [[ -n "$BASE" ]]; then
  BAD=""
  while IFS= read -r line; do
    [[ "$line" =~ ^(feat|fix|docs|chore|refactor|test|ci|build|perf|style|revert)(\([a-z0-9_-]+\))?:\ .+\ \([#][0-9]+\)$ ]] || BAD="$BAD$line; "
  done < <(git log --no-merges --format='%s' "$BASE"...HEAD 2>/dev/null)
  if [[ -n "$BAD" ]]; then fail "TAGF-4 commit subject format" "$BAD"; else pass "TAGF-4 commit subjects follow <type>(<scope>): summary (#issue)"; fi
  BAD=$(git log --no-merges --format='%b' "$BASE"...HEAD 2>/dev/null | grep -iE 'Co-Authored-By:|Generated with|Made with.*ChatGPT|Assisted by' || true)
  if [[ -n "$BAD" ]]; then fail "TAGF-2/4 assistant attribution trailer" "$BAD"; else pass "TAGF-2/4 no assistant attribution trailers"; fi
else
  echo "SKIP  TAGF-4 commit checks (pass a base-ref, e.g. origin/main, in PR CI)"
fi

# Global test-first heuristic: src changes need test changes (only with base-ref)
if [[ -n "$BASE" ]]; then
  CHANGED=$(git diff --name-only "$BASE"...HEAD 2>/dev/null || true)
  SRC=$(echo "$CHANGED" | grep -E '^(services|client/src)/.*\.(java|py|ts|tsx)$' | grep -vE '(test|spec)' || true)
  TEST=$(echo "$CHANGED" | grep -iE '(test|spec)' || true)
  if [[ -n "$SRC" && -z "$TEST" ]]; then
    fail "test-first: source changed without test changes" "$SRC"
  else
    pass "test-first: source changes include test changes (or no source changed)"
  fi
else
  echo "SKIP  test-first heuristic (pass a base-ref, e.g. origin/main, in PR CI)"
fi

echo
if [[ "$FAIL" -eq 0 ]]; then echo "Governance: ALL CHECKPOINTS PASS"; else echo "Governance: VIOLATIONS FOUND"; fi
exit "$FAIL"
