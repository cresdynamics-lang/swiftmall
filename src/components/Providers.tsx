"use client";

import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { SavedProvider } from "@/context/SavedContext";
import { ViewedProvider } from "@/context/ViewedContext";
import type { Product } from "@/lib/product-types";
import type { ReactNode } from "react";

export function Providers({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  return (
    <ProductsProvider products={products}>
      <CartProvider>
        <SavedProvider>
          <ViewedProvider>{children}</ViewedProvider>
        </SavedProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
