/** Storefront labels: index 0 = display/listing photo, then extra angles. */
export const PRODUCT_ANGLE_LABELS = [
  "Display",
  "Side",
  "Back",
  "Detail",
  "Top",
  "Sole",
  "Pack",
  "Extra",
] as const;

/** Labels for the admin “extra angles” section only (not the display image). */
export const EXTRA_ANGLE_LABELS = PRODUCT_ANGLE_LABELS.slice(1);

export function angleLabel(index: number): string {
  return PRODUCT_ANGLE_LABELS[index] ?? `Angle ${index + 1}`;
}

export function extraAngleLabel(index: number): string {
  return EXTRA_ANGLE_LABELS[index] ?? `Angle ${index + 2}`;
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
