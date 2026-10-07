/** Preset size charts the owner can attach to products in admin. */

export type SizePreset = "NONE" | "SHOE_EU" | "TEDDY_CM" | "CUSTOM";

/**
 * Shoe sizes for men's (and kids) fashion: EU 26A → EU 46.
 * 26A is the smallest kids/toddler entry; then whole EU sizes through 46.
 */
export const SHOE_EU_SIZES: string[] = [
  "EU 26A",
  ...Array.from({ length: 46 - 27 + 1 }, (_, i) => `EU ${27 + i}`),
];

/** Gift teddy / soft-toy heights */
export const TEDDY_CM_SIZES = [
  "40 cm",
  "60 cm",
  "80 cm",
  "100 cm",
  "120 cm",
  "160 cm",
  "180 cm",
  "200 cm",
] as const;

export const SIZE_PRESET_OPTIONS: {
  value: SizePreset;
  label: string;
  hint: string;
  options: string[];
}[] = [
  {
    value: "NONE",
    label: "No sizes",
    hint: "Product has no size choice",
    options: [],
  },
  {
    value: "SHOE_EU",
    label: "Shoes (EU 26A–46)",
    hint: "Men's / kids shoe sizes for fashion",
    options: SHOE_EU_SIZES,
  },
  {
    value: "TEDDY_CM",
    label: "Teddy / gift (cm)",
    hint: "Flower gift teddy bear heights",
    options: [...TEDDY_CM_SIZES],
  },
  {
    value: "CUSTOM",
    label: "Custom list",
    hint: "Type your own sizes (comma-separated)",
    options: [],
  },
];

export function detectSizePreset(sizes: string[]): SizePreset {
  if (!sizes.length) return "NONE";
  const shoe = SHOE_EU_SIZES;
  const teddy = TEDDY_CM_SIZES as unknown as string[];
  const isSubset = (pool: string[]) => sizes.every((s) => pool.includes(s));
  if (isSubset(shoe) && sizes.some((s) => shoe.includes(s))) return "SHOE_EU";
  if (isSubset(teddy) && sizes.some((s) => teddy.includes(s))) return "TEDDY_CM";
  return "CUSTOM";
}

export function parseSizesFromForm(formData: FormData): string[] {
  const preset = String(formData.get("sizePreset") ?? "NONE") as SizePreset;
  if (preset === "NONE") return [];

  if (preset === "CUSTOM") {
    return String(formData.get("customSizes") ?? "")
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const selected = formData.getAll("sizes").map(String).map((s) => s.trim()).filter(Boolean);
  if (selected.length) return selected;

  // Fallback: all options for the preset if none checked
  if (preset === "SHOE_EU") return [...SHOE_EU_SIZES];
  if (preset === "TEDDY_CM") return [...TEDDY_CM_SIZES];
  return [];
}
