#!/bin/bash
set -e

# Get version from manifest.json
VERSION=$(node -p "require('./manifest.json').version")

if [ -z "$VERSION" ]; then
  echo "Error: Could not read version from manifest.json"
  exit 1
fi

TAG="v$VERSION"

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: Tag $TAG already exists"
  exit 1
fi

# Build
echo "Building..."
npm run build

# Create release
echo "Creating release $TAG..."
gh release create "$TAG" main.js manifest.json --title "$TAG" --notes "Release $TAG"

echo "Done! Release $TAG created."
