#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  echo "Usage: $0 [--patch|--minor|--major|--version=X.Y.Z] [--tag] [--push]"
  echo ""
  echo "Options:"
  echo "  --patch        Bump patch version (0.1.0 -> 0.1.1)"
  echo "  --minor        Bump minor version (0.1.0 -> 0.2.0)"
  echo "  --major        Bump major version (0.1.0 -> 1.0.0)"
  echo "  --version=X.Y.Z  Set explicit version"
  echo "  --tag          Create a git tag after committing"
  echo "  --push         Push commit and tag to origin (implies --tag)"
  exit 1
}

BUMP=""
EXPLICIT=""
DO_TAG=false
DO_PUSH=false

for arg in "$@"; do
  case "$arg" in
    --patch) BUMP="patch" ;;
    --minor) BUMP="minor" ;;
    --major) BUMP="major" ;;
    --version=*) EXPLICIT="${arg#--version=}" ;;
    --tag) DO_TAG=true ;;
    --push) DO_PUSH=true; DO_TAG=true ;;
    *) usage ;;
  esac
done

if [ -z "$BUMP" ] && [ -z "$EXPLICIT" ]; then
  usage
fi

# Read current version from tauri.conf.json (source of truth)
CURRENT=$(grep -o '"version": "[^"]*"' "$ROOT/src-tauri/tauri.conf.json" | head -1 | cut -d'"' -f4)
echo "Current version: $CURRENT"

if [ -n "$EXPLICIT" ]; then
  NEW="$EXPLICIT"
else
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  case "$BUMP" in
    patch) PATCH=$((PATCH + 1)) ;;
    minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
    major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  esac
  NEW="${MAJOR}.${MINOR}.${PATCH}"
fi

echo "New version: $NEW"

# Update all version locations
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$ROOT/package.json"
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$ROOT/mobile-client/package.json"
sed -i '' "s/\"version\": \"$CURRENT\"/\"version\": \"$NEW\"/" "$ROOT/src-tauri/tauri.conf.json"
sed -i '' "s/^version = \"$CURRENT\"/version = \"$NEW\"/" "$ROOT/src-tauri/Cargo.toml"

# Update Cargo.lock
(cd "$ROOT/src-tauri" && cargo update -p AstroMFD --precise "$NEW" 2>/dev/null || cargo generate-lockfile 2>/dev/null || true)

echo "Updated versions in:"
echo "  - package.json"
echo "  - mobile-client/package.json"
echo "  - src-tauri/tauri.conf.json"
echo "  - src-tauri/Cargo.toml"

# Commit
git -C "$ROOT" add package.json mobile-client/package.json src-tauri/tauri.conf.json src-tauri/Cargo.toml src-tauri/Cargo.lock
git -C "$ROOT" commit -m "release v${NEW}"

echo "Committed: release v${NEW}"

# Tag
if [ "$DO_TAG" = true ]; then
  git -C "$ROOT" tag "v${NEW}"
  echo "Tagged: v${NEW}"
fi

# Push
if [ "$DO_PUSH" = true ]; then
  git -C "$ROOT" push origin main
  git -C "$ROOT" push origin "v${NEW}"
  echo "Pushed commit and tag to origin"
  echo "Release workflow should start shortly."
fi
