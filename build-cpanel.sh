#!/bin/bash

# ─────────────────────────────────────────────
#  CA Aspire BD — cPanel Frontend Build Script
#  Run: bash build-cpanel.sh
# ─────────────────────────────────────────────

set -e

FRONTEND_DIR="frontend"
OUTPUT_FILE="dist-cpanel.tar.gz"
DIST_DIR="$FRONTEND_DIR/dist"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   CA Aspire BD — cPanel Build Script     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: Install dependencies ─────────────────────────────────────────────
echo "▶ Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --silent
cd ..
echo "  ✓ Dependencies installed"

# ── Step 2: Build for production ─────────────────────────────────────────────
echo "▶ Building frontend for production..."
cd "$FRONTEND_DIR"
npm run build
cd ..
echo "  ✓ Build complete"

# ── Step 3: Verify .htaccess exists in dist ───────────────────────────────────
if [ ! -f "$DIST_DIR/.htaccess" ]; then
  echo "▶ Adding .htaccess for React Router support..."
  cat > "$DIST_DIR/.htaccess" << 'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
EOF
  echo "  ✓ .htaccess added"
else
  echo "  ✓ .htaccess already present"
fi

# ── Step 4: Package into tar.gz ──────────────────────────────────────────────
echo "▶ Packaging into $OUTPUT_FILE..."
rm -f "$OUTPUT_FILE"
tar -czf "$OUTPUT_FILE" -C "$DIST_DIR" .
echo "  ✓ Package created"

# ── Step 5: Summary ──────────────────────────────────────────────────────────
SIZE=$(du -sh "$OUTPUT_FILE" | cut -f1)
FILE_COUNT=$(tar -tzf "$OUTPUT_FILE" | wc -l | tr -d ' ')

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║              Build Complete!             ║"
echo "╠══════════════════════════════════════════╣"
printf  "║  File  : %-32s║\n" "$OUTPUT_FILE"
printf  "║  Size  : %-32s║\n" "$SIZE"
printf  "║  Files : %-32s║\n" "$FILE_COUNT files packaged"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Download '$OUTPUT_FILE' from this project"
echo "  2. Extract it on your computer"
echo "  3. Upload all extracted files to public_html/ on your cPanel host"
echo "  4. Replace existing files (keep any other files you have there)"
echo ""
