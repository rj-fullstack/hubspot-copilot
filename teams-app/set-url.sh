#!/usr/bin/env bash
# -------------------------------------------------------
# set-url.sh — Swap base URL across all Teams App config files
# -------------------------------------------------------
# Usage:
#   bash set-url.sh https://abc123.ngrok-free.app     ← local dev via ngrok
#   bash set-url.sh https://hubspot-copilot.vercel.app ← production
# -------------------------------------------------------

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo ""
  echo "Usage: bash set-url.sh <base-url>"
  echo ""
  echo "Examples:"
  echo "  bash set-url.sh https://abc123.ngrok-free.app       ← for local testing"
  echo "  bash set-url.sh https://hubspot-copilot.vercel.app  ← for production"
  echo ""
  exit 1
fi

NEW_URL="${1%/}"  # strip trailing slash if present

# Detect OS for sed -i compatibility (macOS needs '' after -i)
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_INPLACE=(-i '')
else
  SED_INPLACE=(-i)
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "Setting base URL to: $NEW_URL"
echo "------------------------------------------------"

# ---- manifest.json ----
# Replace any http(s)://... URL in websiteUrl, privacyUrl, termsOfUseUrl fields
sed "${SED_INPLACE[@]}" \
  -E "s|\"websiteUrl\": \"https?://[^\"]+\"|\"websiteUrl\": \"$NEW_URL\"|g" \
  "$SCRIPT_DIR/manifest.json"
sed "${SED_INPLACE[@]}" \
  -E "s|\"privacyUrl\": \"https?://[^\"]+\"|\"privacyUrl\": \"$NEW_URL/privacy\"|g" \
  "$SCRIPT_DIR/manifest.json"
sed "${SED_INPLACE[@]}" \
  -E "s|\"termsOfUseUrl\": \"https?://[^\"]+\"|\"termsOfUseUrl\": \"$NEW_URL/terms\"|g" \
  "$SCRIPT_DIR/manifest.json"
echo "  [OK] manifest.json updated"

# ---- ai-plugin.yaml ----
sed "${SED_INPLACE[@]}" \
  -E "s|url: https?://[^ ]+/openapi\.json|url: $NEW_URL/openapi.json|g" \
  "$SCRIPT_DIR/ai-plugin.yaml"
sed "${SED_INPLACE[@]}" \
  -E "s|logo_url: https?://[^ ]+/color\.png|logo_url: $NEW_URL/color.png|g" \
  "$SCRIPT_DIR/ai-plugin.yaml"
echo "  [OK] ai-plugin.yaml updated"

# ---- openapi.json ----
sed "${SED_INPLACE[@]}" \
  -E "s|\"url\": \"https?://[^\"]+\"|\"url\": \"$NEW_URL\"|g" \
  "$SCRIPT_DIR/openapi.json"
echo "  [OK] openapi.json updated"

echo ""
echo "Done! All config files now point to: $NEW_URL"
echo ""
echo "Next step: run build.sh to regenerate appPackage.zip"
echo "  bash build.sh"
echo ""
