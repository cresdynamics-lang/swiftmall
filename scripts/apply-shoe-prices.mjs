import { PrismaClient } from "@prisma/client";

const SHOE_EU_SIZES = [
  "EU 26A",
  ...Array.from({ length: 46 - 27 + 1 }, (_, i) => `EU ${27 + i}`),
];

function euSizeNumber(size) {
  const m = String(size).trim().match(/^EU\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function roundKes(n) {
  return Math.max(50, Math.round(n / 50) * 50);
}

function defaultShoeSizePrices(basePrice, sizes) {
  const base = Math.max(50, Math.round(basePrice) || 0);
  if (!base) return {};
  const out = {};
  for (const size of sizes) {
    const n = euSizeNumber(size);
    if (n == null) {
      out[size] = base;
      continue;
    }
    const factor = Math.min(1.2, Math.max(0.55, 1 + (n - 40) * 0.03));
    out[size] = roundKes(base * factor);
  }
  return out;
}

const prisma = new PrismaClient();

function isShoeSize(size) {
  return /^EU\s*\d{1,2}[A-Za-z]?$/i.test(String(size).trim());
}

const products = await prisma.product.findMany();
let updated = 0;

for (const p of products) {
  const shoeSizes = (p.sizes ?? []).filter(isShoeSize);
  if (shoeSizes.length < 2) continue;

  const sizePrices = defaultShoeSizePrices(p.price, shoeSizes);
  const min = Math.min(...Object.values(sizePrices));
  await prisma.product.update({
    where: { id: p.id },
    data: { sizePrices, price: min },
  });
  console.log(
    "updated",
    p.slug,
    "EU40",
    sizePrices["EU 40"] ?? "—",
    "EU46",
    sizePrices["EU 46"] ?? "—",
    "from",
    min,
  );
  updated += 1;
}

console.log("done", updated);
await prisma.$disconnect();
