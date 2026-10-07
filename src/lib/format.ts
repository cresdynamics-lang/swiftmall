import type { OfferTag, Product } from "@/lib/product-types";

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function discountPercent(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/** Real savings from catalogue prices — never hand-typed. */
export function saveAmount(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return oldPrice - price;
}

/** Flash / card scarcity: only when stock is a real number ≤ 5. */
export function isLowStock(stock: number, threshold = 5): boolean {
  return stock > 0 && stock <= threshold;
}

/** Badge text for hero tiles / promo chips, driven by admin offerTag + prices. */
export function offerTagLabel(product: Pick<Product, "price" | "oldPrice" | "offerTag">): string | null {
  const pct = discountPercent(product.price, product.oldPrice);
  switch (product.offerTag as OfferTag) {
    case "TODAY":
      return pct != null ? `-${pct}% today` : "Deal today";
    case "THIS_WEEK":
      return pct != null ? `-${pct}% this week` : "This week";
    case "NEW":
      return "New";
    default:
      return null;
  }
}
