"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";
import { fromPrice } from "@/lib/product-price";
import type { Product } from "@/lib/product-types";

export function MetaViewContent({
  product,
}: {
  product: Pick<
    Product,
    "id" | "sku" | "name" | "category" | "price" | "sizePrices" | "sizes"
  >;
}) {
  useEffect(() => {
    trackViewContent({
      contentIds: [product.id],
      contentName: product.name,
      contentCategory: product.category,
      value: fromPrice(product),
    });
  }, [product.id, product.name, product.category, product.price, product.sizePrices, product.sizes]);

  return null;
}
