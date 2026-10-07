import type { OfferTag, Product } from "@/lib/product-types";

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function discountPercent(price: number, oldPrice?: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
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
