#!/usr/bin/env bash
# Compute the next Semantic Version, Git tag, and monotonic Android versionCode.
#
# Usage:
#   scripts/compute-release-version.sh <patch|minor|major|custom> [custom_version]
#
# Env:
#   BASE_TAG  Optional override for the previous SemVer tag (default: latest git vX.Y.Z tag).
#
# Output (key=value lines, compatible with $GITHUB_OUTPUT):
#   previous_tag=<tag or empty>
#   version=<X.Y.Z[-prerelease]>
#   tag=v<version>
#   version_code=<major*10000 + minor*100 + patch>
set -euo pipefail

BUMP="${1:-}"
CUSTOM="${2:-}"

if [[ -z "$BUMP" ]]; then
  echo "Usage: $0 <patch|minor|major|custom> [custom_version]" >&2
  exit 2
fi

if [[ "${BASE_TAG+x}" == "x" ]]; then
  PREV_TAG="$BASE_TAG"
else
  PREV_TAG="$(git tag -l 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -n 1 || true)"
fi

BASE_VER="${PREV_TAG#v}"
if [[ -z "$BASE_VER" ]]; then
  BASE_VER="0.0.0"
fi

if [[ ! "$BASE_VER" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-([0-9A-Za-z.-]+))?$ ]]; then
  echo "Invalid base version: '$BASE_VER'" >&2
  exit 1
fi

MAJOR="${BASH_REMATCH[1]}"
MINOR="${BASH_REMATCH[2]}"
PATCH="${BASH_REMATCH[3]}"
PRERELEASE=""

case "$BUMP" in
  patch)
    PATCH=$((PATCH + 1))
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  custom)
    CLEAN="${CUSTOM#v}"
    if [[ ! "$CLEAN" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-([0-9A-Za-z.-]+))?$ ]]; then
      echo "Invalid custom SemVer: '$CUSTOM' (expected X.Y.Z or X.Y.Z-prerelease)" >&2
      exit 1
    fi
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    PATCH="${BASH_REMATCH[3]}"
    PRERELEASE="${BASH_REMATCH[4]:-}"
    ;;
  *)
    echo "Unknown bump type: '$BUMP' (expected patch, minor, major, or custom)" >&2
    exit 2
    ;;
esac

if (( MINOR >= 100 || PATCH >= 100 )); then
  echo "Minor and patch must be < 100 for versionCode encoding (got $MAJOR.$MINOR.$PATCH)" >&2
  exit 1
fi

VERSION="${MAJOR}.${MINOR}.${PATCH}${PRERELEASE}"
VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))

echo "previous_tag=${PREV_TAG}"
echo "version=${VERSION}"
echo "tag=v${VERSION}"
echo "version_code=${VERSION_CODE}"
