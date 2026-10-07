import { prisma } from "@/lib/db";
import { mapProduct } from "@/lib/mappers";
import type { Product } from "@/lib/product-types";

export type { Product } from "@/lib/product-types";

export async function listLiveProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { live: true },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProduct);
}

export async function listAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map(mapProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!row || !row.live) return undefined;
  return mapProduct(row);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!row) return undefined;
  return mapProduct(row);
}

export async function getProductsByCategory(
  categorySlug: string,
  gender?: "mens" | "womens",
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: {
      live: true,
      category: { slug: categorySlug },
      ...(gender
        ? { gender: gender === "mens" ? "MENS" : "WOMENS" }
        : {}),
    },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProduct);
}

export function filterProducts(
  products: Product[],
  query: string,
  limit = 8,
): Product[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return products
    .filter((p) => {
      const hay = `${p.name} ${p.brand ?? ""} ${p.category} ${p.subCategory ?? ""}`.toLowerCase();
      return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
    })
    .slice(0, limit);
}
