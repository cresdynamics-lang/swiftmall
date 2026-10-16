import { catalogItemId } from "@/lib/meta-catalog";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()) ||
  "";

export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (options?.eventID) {
    window.fbq("track", event, params ?? {}, { eventID: options.eventID });
  } else {
    window.fbq("track", event, params ?? {});
  }
}

export function metaContentId(productId: string, size?: string | null) {
  return catalogItemId(productId, size);
}

export type MetaContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

export function trackViewContent(input: {
  contentIds: string[];
  contentName?: string;
  contentCategory?: string;
  value: number;
  currency?: string;
}) {
  trackMeta("ViewContent", {
    content_ids: input.contentIds,
    content_type: "product",
    content_name: input.contentName,
    content_category: input.contentCategory,
    value: input.value,
    currency: input.currency ?? "KES",
  });
}

export function trackAddToCart(input: {
  contentIds: string[];
  contentName?: string;
  value: number;
  currency?: string;
}) {
  trackMeta("AddToCart", {
    content_ids: input.contentIds,
    content_type: "product",
    content_name: input.contentName,
    value: input.value,
    currency: input.currency ?? "KES",
  });
}

export function trackInitiateCheckout(input: {
  contentIds: string[];
  numItems: number;
  value: number;
  currency?: string;
}) {
  trackMeta("InitiateCheckout", {
    content_ids: input.contentIds,
    content_type: "product",
    num_items: input.numItems,
    value: input.value,
    currency: input.currency ?? "KES",
  });
}

export function trackPurchase(input: {
  contentIds: string[];
  contents?: MetaContentItem[];
  value: number;
  currency?: string;
  orderId?: string;
}) {
  trackMeta(
    "Purchase",
    {
      content_ids: input.contentIds,
      content_type: "product",
      contents: input.contents,
      value: input.value,
      currency: input.currency ?? "KES",
      order_id: input.orderId,
    },
    input.orderId ? { eventID: `purchase_${input.orderId}` } : undefined,
  );
}

export function trackSearch(searchString: string) {
  trackMeta("Search", { search_string: searchString });
}

export function trackAddToWishlist(input: {
  contentIds: string[];
  value?: number;
  currency?: string;
}) {
  trackMeta("AddToWishlist", {
    content_ids: input.contentIds,
    content_type: "product",
    value: input.value,
    currency: input.currency ?? "KES",
  });
}
