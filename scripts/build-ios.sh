#!/usr/bin/env bash
# Build the web game for iOS and copy assets into the Swift Playgrounds package.
#
# Usage: ./scripts/build-ios.sh
#   Run from the project root (My-University/).
#
# Requirements: Node.js, npm

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SWIFT_PKG="$PROJECT_ROOT/ios/MyUniversity.swiftpm"
WEB_DEST="$SWIFT_PKG/Sources/Resources/web"

echo "==> Building web game with iOS config (relative paths)..."
cd "$PROJECT_ROOT"
npm run build:ios

echo "==> Copying dist-ios/ -> $WEB_DEST"
rm -rf "$WEB_DEST"
mkdir -p "$WEB_DEST"
cp -r "$PROJECT_ROOT/dist-ios/." "$WEB_DEST/"

echo ""
echo "Done! Web assets are bundled at:"
echo "  $WEB_DEST"
echo ""
echo "Next steps:"
echo "  1. Open ios/MyUniversity.swiftpm in Swift Playgrounds (iPad) or Xcode"
echo "  2. Build and run on your iOS device or simulator"
