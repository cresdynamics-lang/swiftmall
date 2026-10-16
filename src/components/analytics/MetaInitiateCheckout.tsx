"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { metaContentId, trackInitiateCheckout } from "@/lib/meta-pixel";

export function MetaInitiateCheckout() {
  const { lines, itemCount, total } = useCart();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || lines.length === 0) return;
    sent.current = true;
    const contentIds = lines.map((l) => metaContentId(l.productId, l.size));
    trackInitiateCheckout({
      contentIds,
      numItems: itemCount,
      value: total,
    });
  }, [lines, itemCount, total]);

  return null;
}
