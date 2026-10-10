import { TEDDY_CM_SIZES } from "@/lib/product-sizes";
import type { Product } from "@/lib/product-types";

/** Anchors from owner: 40 cm → KES 1,200 · 200 cm → KES 10,000 */
export const TEDDY_SIZE_PRICES: Record<string, number> = {
  "40 cm": 1200,
  "60 cm": 2300,
  "80 cm": 3400,
  "100 cm": 4500,
  "120 cm": 5600,
  "160 cm": 7800,
  "180 cm": 8900,
  "200 cm": 10000,
};

export function parseSizePrices(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof value === "number" ? value : Number(value);
    if (key.trim() && Number.isFinite(n) && n > 0) out[key.trim()] = Math.round(n);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Unit price for a cart/checkout line — uses size price when set. */
export function priceForProduct(
  product: Pick<Product, "price" | "sizePrices" | "sizes">,
  size?: string | null,
): number {
  if (size && product.sizePrices?.[size] != null) {
    return product.sizePrices[size];
  }
  return product.price;
}

/** Lowest priced size (for “from KES …” on cards). */
export function fromPrice(product: Pick<Product, "price" | "sizePrices">): number {
  const values = product.sizePrices ? Object.values(product.sizePrices) : [];
  if (!values.length) return product.price;
  return Math.min(...values);
}

export function defaultTeddySizePrices(
  sizes: string[] = [...TEDDY_CM_SIZES],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const size of sizes) {
    if (TEDDY_SIZE_PRICES[size] != null) out[size] = TEDDY_SIZE_PRICES[size];
  }
  return out;
}

/** Parse admin fields sizePrice[40 cm]=1200 */
export function parseSizePricesFromForm(
  formData: FormData,
  sizes: string[],
): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const size of sizes) {
    const raw = formData.get(`sizePrice[${size}]`);
    if (raw == null || String(raw).trim() === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) out[size] = Math.round(n);
  }
  return Object.keys(out).length ? out : undefined;
}
