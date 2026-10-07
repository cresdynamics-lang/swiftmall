"use client";

import { CartProvider } from "@/context/CartContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { SavedProvider } from "@/context/SavedContext";
import { ViewedProvider } from "@/context/ViewedContext";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/product-types";
import type { RuntimeSettings } from "@/lib/settings";
import type { ReactNode } from "react";

export function Providers({
  children,
  products,
  settings,
  categories,
}: {
  children: ReactNode;
  products: Product[];
  settings: RuntimeSettings;
  categories: Category[];
}) {
  return (
    <ProductsProvider products={products}>
      <CategoriesProvider categories={categories}>
        <CartProvider shippingFlatKes={settings.shippingFlatKes}>
          <SavedProvider>
            <ViewedProvider>{children}</ViewedProvider>
          </SavedProvider>
        </CartProvider>
      </CategoriesProvider>
    </ProductsProvider>
  );
}
