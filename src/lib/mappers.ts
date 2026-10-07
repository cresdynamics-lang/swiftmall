import type { Category as DbCategory, Product as DbProduct } from "@prisma/client";
import type { Gender, OfferTag, Product } from "@/lib/product-types";

type DbProductWithCategory = DbProduct & { category?: DbCategory | null };

export function mapProduct(row: DbProductWithCategory): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category?.slug ?? "",
    categoryName: row.category?.name,
    subCategory: row.subCategory ?? undefined,
    brand: row.brand ?? undefined,
    sku: row.sku ?? undefined,
    price: row.price,
    oldPrice: row.oldPrice ?? undefined,
    stock: row.stock,
    lowStockAt: row.lowStockAt,
    images: row.images.length ? row.images : ["/products/p01.jpg"],
    description: row.description,
    flashDeal: row.flashDeal,
    featured: row.featured,
    live: row.live,
    offerTag: row.offerTag as OfferTag,
    gender: row.gender
      ? ((row.gender === "MENS" ? "mens" : "womens") as Gender)
      : undefined,
  };
}
