#!/usr/bin/env bash
# -------------------------------------------------------
# build.sh — Package the Teams App into appPackage.zip
# -------------------------------------------------------
# This zip is what you upload to Teams Admin Center.
# It must contain: manifest.json, color.png, outline.png
# -------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="$SCRIPT_DIR/appPackage.zip"

echo ""
echo "Building Teams App package..."
echo "------------------------------------------------"

# Check required files exist
MISSING=0
for f in manifest.json ai-plugin.json openapi.json color.png outline.png; do
  if [ ! -f "$SCRIPT_DIR/$f" ]; then
    echo "  ERROR: Missing required file: $f"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 1 ]; then
  echo ""
  echo "Fix missing files and re-run build.sh"
  exit 1
fi

# Remove old zip if it exists
[ -f "$OUTPUT" ] && rm "$OUTPUT"

# Build the zip — prefer Node.js (handles LF endings), fall back to native zip
cd "$SCRIPT_DIR"
if command -v node &> /dev/null; then
  node build-zip.js
elif command -v zip &> /dev/null; then
  zip -j "$OUTPUT" manifest.json ai-plugin.json openapi.json color.png outline.png
else
  echo ""
  echo "ERROR: Neither 'node' nor 'zip' is installed."
  echo "Install Node.js from https://nodejs.org"
  echo ""
  exit 1
fi

echo ""
echo "  [OK] appPackage.zip created successfully"
echo "  Location: $OUTPUT"
echo ""
echo "Next steps:"
echo "  1. Go to https://admin.teams.microsoft.com"
echo "  2. Navigate to: Teams apps > Manage apps > Upload"
echo "  3. Upload appPackage.zip"
echo "  4. Wait 10-15 minutes for Copilot to register the plugin"
echo "  5. Test in Copilot with: '@HubSpot CRM find deals for Acme Corp'"
echo ""
