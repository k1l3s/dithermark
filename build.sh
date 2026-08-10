#!/usr/bin/env bash
# Builds the production web bundle and packages the standalone desktop app.
#
# Usage: ./build.sh
#
# Output:
#   deploy/public_html/      production web build
#   desktop/dist/            packaged Electron app (AppImage on Linux,
#                            .app on macOS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

if ! command -v npm >/dev/null 2>&1; then
    echo "Error: npm not found. Install Node.js first (e.g. sudo pacman -S nodejs npm)." >&2
    exit 1
fi

if [ ! -f "$ROOT/unsplash-secrets.js" ]; then
    echo "==> Creating unsplash-secrets.js from example (Unsplash disabled)"
    cp "$ROOT/unsplash-secrets.example.js" "$ROOT/unsplash-secrets.js"
fi

echo "==> Installing web dependencies"
cd "$ROOT"
npm install

echo "==> Building production web bundle (deploy/public_html)"
npm run deploy

echo "==> Installing desktop dependencies"
cd "$ROOT/desktop"
npm install

echo "==> Packaging standalone app"
npm run dist

echo
echo "Done. Packaged app is in desktop/dist/:"
ls -1 "$ROOT/desktop/dist" | grep -v -E '^(builder-|__)' || true
