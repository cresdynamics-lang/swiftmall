import type { Product } from "@/lib/product-types";

/** Prefer discounted / flash / featured item in a category for nav hover. */
export function getCategoryOffer(
  products: Product[],
  categorySlug: string,
): Product | undefined {
  const inCat = products.filter((p) => p.category === categorySlug && p.stock > 0);
  return (
    inCat.find((p) => p.offerTag === "TODAY") ||
    inCat.find((p) => p.offerTag === "THIS_WEEK") ||
    inCat.find((p) => p.flashDeal && p.oldPrice) ||
    inCat.find((p) => p.oldPrice) ||
    inCat.find((p) => p.offerTag === "NEW") ||
    inCat.find((p) => p.featured) ||
    inCat.find((p) => p.flashDeal) ||
    inCat[0]
  );
}
