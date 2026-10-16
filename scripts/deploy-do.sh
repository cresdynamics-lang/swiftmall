#!/usr/bin/env bash
# Deploy Swiftmall to DigitalOcean (deploy@143.198.169.74 → /var/www/sites/swiftmall.co.ke)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DO_HOST:-deploy@143.198.169.74}"
KEY="${DO_SSH_KEY:-$HOME/.ssh/do_migration_ed25519}"
REMOTE_DIR="/var/www/sites/swiftmall.co.ke"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
RSYNC=(rsync -az --delete
  --exclude node_modules
  --exclude .next
  --exclude .env
  --exclude .git
  --exclude /uploads
  --exclude "_product_photos"
  --exclude "_brand_logos"
  --exclude "tsconfig.tsbuildinfo"
)

echo "→ rsync to $HOST:$REMOTE_DIR"
"${RSYNC[@]}" -e "ssh -i $KEY -o BatchMode=yes" \
  --rsync-path="sudo rsync" \
  "$ROOT"/ "$HOST:$REMOTE_DIR/"

echo "→ build + restart on server"
"${SSH[@]}" "$HOST" "sudo -u site_swift bash -lc '
  set -euo pipefail
  cd $REMOTE_DIR
  mkdir -p uploads/products uploads/hero
  npx prisma generate
  npx prisma db push
  NODE_ENV=production NODE_OPTIONS=--max-old-space-size=1536 npm run build
  pm2 restart swiftmall
  pm2 status swiftmall
'"

echo "✓ deployed to $HOST"