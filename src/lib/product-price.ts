import { SHOE_EU_SIZES, TEDDY_CM_SIZES } from "@/lib/product-sizes";
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

function euSizeNumber(size: string): number | null {
  const m = size.trim().match(/^EU\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function roundKes(n: number): number {
  if (n >= 2000) return Math.max(100, Math.round(n / 50) * 50);
  return Math.max(50, Math.round(n / 50) * 50);
}

/**
 * Graduated shoe prices around a listing/base (anchored at EU 40).
 * Smaller kids sizes cost less; larger adult sizes cost more.
 */
export function defaultShoeSizePrices(
  basePrice: number,
  sizes: string[] = [...SHOE_EU_SIZES],
): Record<string, number> {
  const base = Math.max(50, Math.round(basePrice) || 0);
  if (!base) return {};
  const out: Record<string, number> = {};
  for (const size of sizes) {
    const n = euSizeNumber(size);
    if (n == null) {
      out[size] = base;
      continue;
    }
    // ~3% per EU size vs EU 40; clamp so kids stay affordable
    const factor = Math.min(1.2, Math.max(0.55, 1 + (n - 40) * 0.03));
    out[size] = roundKes(base * factor);
  }
  return out;
}

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

function teddyCmNumber(size: string): number | null {
  const m = size.trim().match(/^(\d{1,3})\s*cm$/i);
  return m ? Number(m[1]) : null;
}

/** Interpolate / extend teddy ladder (40 cm = 1,200 · 200 cm = 10,000). */
export function teddyPriceForCm(cm: number): number {
  const lo = 40;
  const hi = 200;
  const pLo = 1200;
  const pHi = 10000;
  const t = (cm - lo) / (hi - lo);
  return roundKes(pLo + t * (pHi - pLo));
}

export function defaultTeddySizePrices(
  sizes: string[] = [...TEDDY_CM_SIZES],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const size of sizes) {
    if (TEDDY_SIZE_PRICES[size] != null) {
      out[size] = TEDDY_SIZE_PRICES[size];
      continue;
    }
    const cm = teddyCmNumber(size);
    if (cm != null) out[size] = teddyPriceForCm(cm);
  }
  return out;
}

/** True when every size uses the same KES (needs a real size scale). */
export function sizePricesAreFlat(sizePrices: Record<string, number> | undefined): boolean {
  if (!sizePrices) return true;
  const values = Object.values(sizePrices);
  if (values.length < 2) return true;
  return values.every((v) => v === values[0]);
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
