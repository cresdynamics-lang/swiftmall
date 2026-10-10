import { PrismaClient } from "@prisma/client";

const TEDDY_CM_SIZES = [
  "40 cm",
  "60 cm",
  "80 cm",
  "100 cm",
  "120 cm",
  "160 cm",
  "180 cm",
  "200 cm",
];

const TEDDY_SIZE_PRICES = {
  "40 cm": 1200,
  "60 cm": 2300,
  "80 cm": 3400,
  "100 cm": 4500,
  "120 cm": 5600,
  "160 cm": 7800,
  "180 cm": 8900,
  "200 cm": 10000,
};

const prisma = new PrismaClient();
const sizes = [...TEDDY_CM_SIZES];
const sizePrices = { ...TEDDY_SIZE_PRICES };
const min = Math.min(...Object.values(sizePrices));

const products = await prisma.product.findMany({
  where: {
    OR: [
      { name: { contains: "teddy", mode: "insensitive" } },
      { slug: { contains: "teddy" } },
    ],
  },
});

for (const p of products) {
  await prisma.product.update({
    where: { id: p.id },
    data: {
      sizes,
      sizePrices,
      price: min,
    },
  });
  console.log("updated", p.slug, "→ from", min, "· 200 cm", sizePrices["200 cm"]);
}

console.log("done", products.length);
await prisma.$disconnect();
