#!/usr/bin/env bash
# Unit tests for scripts/compute-release-version.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="$ROOT/scripts/compute-release-version.sh"

FAIL=0
assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then
    echo "PASS  $label"
  else
    echo "FAIL  $label (expected '$expected', got '$actual')" >&2
    FAIL=1
  fi
}

assert_fail() {
  local label="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "FAIL  $label (expected non-zero exit)" >&2
    FAIL=1
  else
    echo "PASS  $label"
  fi
}

run_case() {
  local base_tag="$1" bump="$2" custom="${3:-}"
  BASE_TAG="$base_tag" bash "$SCRIPT" "$bump" "$custom"
}

out="$(run_case "v2.1.0" "patch")"
assert_eq "patch version" "version=2.1.1" "$(echo "$out" | grep '^version=')"
assert_eq "patch tag" "tag=v2.1.1" "$(echo "$out" | grep '^tag=')"
assert_eq "patch version_code" "version_code=20101" "$(echo "$out" | grep '^version_code=')"

out="$(run_case "v2.1.0" "minor")"
assert_eq "minor version" "version=2.2.0" "$(echo "$out" | grep '^version=')"
assert_eq "minor version_code" "version_code=20200" "$(echo "$out" | grep '^version_code=')"

out="$(run_case "v2.1.0" "major")"
assert_eq "major version" "version=3.0.0" "$(echo "$out" | grep '^version=')"
assert_eq "major version_code" "version_code=30000" "$(echo "$out" | grep '^version_code=')"

out="$(run_case "v2.1.0" "custom" "2.5.3")"
assert_eq "custom bare version" "version=2.5.3" "$(echo "$out" | grep '^version=')"
assert_eq "custom bare tag" "tag=v2.5.3" "$(echo "$out" | grep '^tag=')"
assert_eq "custom bare version_code" "version_code=20503" "$(echo "$out" | grep '^version_code=')"

out="$(run_case "v2.1.0" "custom" "v2.2.0-rc.1")"
assert_eq "custom prerelease version" "version=2.2.0-rc.1" "$(echo "$out" | grep '^version=')"
assert_eq "custom prerelease tag" "tag=v2.2.0-rc.1" "$(echo "$out" | grep '^tag=')"
assert_eq "custom prerelease version_code" "version_code=20200" "$(echo "$out" | grep '^version_code=')"

out="$(run_case "" "minor")"
assert_eq "no prior tag defaults 0.0.0 -> 0.1.0" "version=0.1.0" "$(echo "$out" | grep '^version=')"
assert_eq "no prior tag version_code" "version_code=100" "$(echo "$out" | grep '^version_code=')"

assert_fail "rejects invalid custom semver" env BASE_TAG="v2.1.0" bash "$SCRIPT" "custom" "not-a-version"
assert_fail "rejects missing custom version" env BASE_TAG="v2.1.0" bash "$SCRIPT" "custom" ""
assert_fail "rejects unknown bump type" env BASE_TAG="v2.1.0" bash "$SCRIPT" "nightly"

exit "$FAIL"
