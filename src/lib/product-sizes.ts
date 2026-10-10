/** Preset size charts the owner can attach to products in admin. */

export type SizePreset = "NONE" | "SHOE_EU" | "TEDDY_CM" | "CUSTOM";

/**
 * Common shoe chart: EU 26A → EU 46.
 * Admin can also add sizes below/above this (e.g. EU 22, EU 24, EU 48).
 */
export const SHOE_EU_SIZES: string[] = [
  "EU 26A",
  ...Array.from({ length: 46 - 27 + 1 }, (_, i) => `EU ${27 + i}`),
];

/** Gift teddy / soft-toy heights — extras like 30 cm can be added in admin */
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
    label: "Shoes (EU)",
    hint: "EU shoe sizes — add any size below or above the chart (e.g. 22, 24, 48)",
    options: SHOE_EU_SIZES,
  },
  {
    value: "TEDDY_CM",
    label: "Teddy / gift (cm)",
    hint: "Teddy heights — add any cm size (e.g. 30 cm) if needed",
    options: [...TEDDY_CM_SIZES],
  },
  {
    value: "CUSTOM",
    label: "Custom list",
    hint: "Type your own sizes (comma-separated)",
    options: [],
  },
];

/** "24", "EU24", "eu 26a" → "EU 24" / "EU 26A" */
export function normalizeShoeSize(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(?:EU\s*)?(\d{1,2})\s*([A-Za-z])?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 15 || n > 55) return null;
  const suffix = m[2] ? m[2].toUpperCase() : "";
  return suffix ? `EU ${n}${suffix}` : `EU ${n}`;
}

/** "30", "30cm", "30 cm" → "30 cm" */
export function normalizeTeddySize(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,3})\s*cm$/i) || t.match(/^(\d{1,3})$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 10 || n > 300) return null;
  return `${n} cm`;
}

export function isShoeSizeLabel(size: string): boolean {
  return /^EU\s*\d{1,2}[A-Za-z]?$/i.test(size.trim());
}

export function isTeddySizeLabel(size: string): boolean {
  return /^\d{1,3}\s*cm$/i.test(size.trim());
}

function shoeSortKey(size: string): number {
  const m = size.trim().match(/^EU\s*(\d{1,2})([A-Za-z])?$/i);
  if (!m) return 9999;
  return Number(m[1]) * 10 + (m[2] ? 0 : 1);
}

function teddySortKey(size: string): number {
  const m = size.trim().match(/^(\d{1,3})\s*cm$/i);
  return m ? Number(m[1]) : 9999;
}

export function sortSizes(sizes: string[], preset: SizePreset): string[] {
  const copy = [...sizes];
  if (preset === "SHOE_EU") return copy.sort((a, b) => shoeSortKey(a) - shoeSortKey(b));
  if (preset === "TEDDY_CM") return copy.sort((a, b) => teddySortKey(a) - teddySortKey(b));
  return copy;
}

export function detectSizePreset(sizes: string[]): SizePreset {
  if (!sizes.length) return "NONE";
  if (sizes.every(isShoeSizeLabel) && sizes.some(isShoeSizeLabel)) return "SHOE_EU";
  if (sizes.every(isTeddySizeLabel) && sizes.some(isTeddySizeLabel)) return "TEDDY_CM";
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

  const selected = formData
    .getAll("sizes")
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);
  if (selected.length) {
    if (preset === "SHOE_EU") return sortSizes(selected, "SHOE_EU");
    if (preset === "TEDDY_CM") return sortSizes(selected, "TEDDY_CM");
    return selected;
  }

  // Fallback: all options for the preset if none checked
  if (preset === "SHOE_EU") return [...SHOE_EU_SIZES];
  if (preset === "TEDDY_CM") return [...TEDDY_CM_SIZES];
  return [];
}
