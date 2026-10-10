/** Ordered angle labels for product photos (index 0 = listing / front). */
export const PRODUCT_ANGLE_LABELS = [
  "Front",
  "Side",
  "Back",
  "Detail",
  "Top",
  "Sole",
  "Pack",
  "Extra",
] as const;

export function angleLabel(index: number): string {
  return PRODUCT_ANGLE_LABELS[index] ?? `Angle ${index + 1}`;
}

/** Mens/Womens filters also include unisex items. */
export function genderMatchesFilter(
  productGender: "mens" | "womens" | "unisex" | undefined,
  filter?: "mens" | "womens" | "unisex",
): boolean {
  if (!filter) return true;
  if (!productGender) return false;
  if (filter === "unisex") return productGender === "unisex";
  if (productGender === "unisex") return true;
  return productGender === filter;
}

/** Map fashion nav child slug → storefront gender filter (order matters: womens before mens). */
export function fashionGenderFromSlug(
  slug: string,
): "mens" | "womens" | "unisex" | undefined {
  if (slug.startsWith("unisex")) return "unisex";
  if (slug.startsWith("womens")) return "womens";
  if (slug.startsWith("mens")) return "mens";
  return undefined;
}
