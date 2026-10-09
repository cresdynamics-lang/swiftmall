/** Beauty (and similar) sub-department labels used in admin + category filters. */

export type SubOption = { slug: string; label: string };

export const CATEGORY_SUB_OPTIONS: Record<string, SubOption[]> = {
  "health-and-beauty": [
    { slug: "skincare", label: "Skincare" },
    { slug: "hair-care", label: "Hair care" },
    { slug: "wellness", label: "Wellness & supplements" },
    { slug: "lips-masks", label: "Lips & face masks" },
  ],
  fashion: [
    { slug: "shoes", label: "Shoes" },
    { slug: "shoes-sandals", label: "Shoes & Sandals" },
    { slug: "handbags-wallets", label: "Handbags & Wallets" },
    { slug: "clothing", label: "Clothing" },
    { slug: "watches-belts", label: "Watches & Belts" },
    { slug: "jewellery", label: "Jewellery" },
    { slug: "bags", label: "Bags" },
  ],
  "gifts-and-accessories": [
    { slug: "flowers", label: "Flowers" },
    { slug: "teddies", label: "Teddies & soft toys" },
    { slug: "jewellery", label: "Jewellery" },
    { slug: "watches", label: "Watches" },
  ],
  "kitchen-and-home": [
    { slug: "appliances", label: "Appliances" },
    { slug: "tableware", label: "Tableware" },
  ],
  electronics: [
    { slug: "tv-audio", label: "TV & audio" },
    { slug: "car", label: "Car electronics" },
  ],
  "phones-and-accessories": [
    { slug: "phones", label: "Phones" },
    { slug: "audio", label: "Earbuds & audio" },
    { slug: "chargers", label: "Chargers & cables" },
  ],
  others: [
    { slug: "fitness", label: "Fitness" },
  ],
};

/** Suggested size preset when creating in a department. */
export function suggestedSizePreset(
  categorySlug: string,
): "NONE" | "SHOE_EU" | "TEDDY_CM" {
  if (categorySlug === "fashion") return "SHOE_EU";
  if (categorySlug === "gifts-and-accessories") return "TEDDY_CM";
  return "NONE";
}

export function needsGender(categorySlug: string) {
  return categorySlug === "fashion";
}

/** Match a product subCategory string to a nav child slug. */
export function productMatchesSub(
  subCategory: string | null | undefined,
  subSlug: string,
): boolean {
  if (!subCategory) return false;
  const hay = subCategory.toLowerCase();
  const option = Object.values(CATEGORY_SUB_OPTIONS)
    .flat()
    .find((o) => o.slug === subSlug);
  if (option) {
    const labelBits = option.label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (labelBits.every((b) => hay.includes(b)) || hay.includes(option.label.toLowerCase())) {
      return true;
    }
  }
  // slug tokens e.g. lips-masks → lips, masks
  const tokens = subSlug.toLowerCase().split("-").filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => hay.includes(t));
}
