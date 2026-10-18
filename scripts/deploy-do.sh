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
  --exclude .pm2
  --exclude .cache
  --exclude .npm
  --exclude .config
  --exclude /uploads
  --exclude "_product_photos"
  --exclude "_brand_logos"
  --exclude "tsconfig.tsbuildinfo"
)

echo "→ rsync to $HOST:$REMOTE_DIR"
"${RSYNC[@]}" -e "ssh -i $KEY -o BatchMode=yes" \
  --rsync-path="sudo rsync" \
  "$ROOT"/ "$HOST:$REMOTE_DIR/"

echo "→ fix ownership + build + restart"
"${SSH[@]}" "$HOST" "sudo chown -R site_swift:websites $REMOTE_DIR && \
  sudo mkdir -p $REMOTE_DIR/.pm2/logs $REMOTE_DIR/.pm2/pids $REMOTE_DIR/.pm2/modules && \
  echo '{}' | sudo tee $REMOTE_DIR/.pm2/module_conf.json >/dev/null && \
  sudo chown -R site_swift:site_swift $REMOTE_DIR/.pm2 && \
  sudo -u site_swift bash -lc '
  set -euo pipefail
  cd $REMOTE_DIR
  mkdir -p uploads/products uploads/hero
  # Generate client. Migrations that ALTER ENUM need DB owner (postgres);
  # run those once via: sudo -u postgres psql -d swiftmall -f prisma/migrations/.../migration.sql
  # then: npx prisma migrate resolve --applied <name>
  npx prisma generate
  npx prisma migrate deploy || true
  NODE_ENV=production NODE_OPTIONS=--max-old-space-size=1536 npm run build
  # Clean restart so port 3020 is not left held by a stale Next process.
  pm2 delete swiftmall 2>/dev/null || true
  fuser -k 3020/tcp 2>/dev/null || true
  sleep 1
  pm2 start ecosystem.config.cjs
  pm2 save
  pm2 status swiftmall
'"

echo "✓ deployed to $HOST"