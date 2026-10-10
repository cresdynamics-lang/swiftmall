#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# /uploads is anchored — do NOT use bare "uploads" or src/app/uploads is skipped
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .env \
  --exclude .git \
  --exclude /uploads \
  --exclude "_product_photos" \
  --exclude "_brand_logos" \
  --exclude "tsconfig.tsbuildinfo" \
  "$ROOT"/ contabo:/var/www/sites/swiftmall.co.ke/
ssh contabo 'cd /var/www/sites/swiftmall.co.ke && mkdir -p uploads/products uploads/hero && npx prisma generate && npx prisma db push && NODE_ENV=production npm run build && pm2 restart swiftmall'
