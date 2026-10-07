import { products, type Product } from "@/lib/products";

/** Prefer discounted / flash / featured item in a category for nav hover. */
export function getCategoryOffer(categorySlug: string): Product | undefined {
  const inCat = products.filter((p) => p.category === categorySlug && p.stock > 0);
  return (
    inCat.find((p) => p.flashDeal && p.oldPrice) ||
    inCat.find((p) => p.oldPrice) ||
    inCat.find((p) => p.featured) ||
    inCat.find((p) => p.flashDeal) ||
    inCat[0]
  );
}
