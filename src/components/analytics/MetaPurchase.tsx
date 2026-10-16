"use client";

import { useEffect, useRef } from "react";
import { metaContentId, trackPurchase } from "@/lib/meta-pixel";

type PurchaseItem = {
  productId: string;
  name: string;
  qty: number;
  size?: string | null;
  unitPrice: number;
};

export function MetaPurchase({
  orderId,
  value,
  items,
}: {
  orderId: string;
  value: number;
  items: PurchaseItem[];
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !orderId || !items.length) return;
    sent.current = true;
    const contentIds = items.map((i) => metaContentId(i.productId, i.size));
    trackPurchase({
      contentIds,
      contents: items.map((i) => ({
        id: metaContentId(i.productId, i.size),
        quantity: i.qty,
        item_price: i.unitPrice,
      })),
      value,
      orderId,
    });
  }, [orderId, value, items]);

  return null;
}
