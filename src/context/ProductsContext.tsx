"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/product-types";

type ProductsContextValue = {
  products: Product[];
  byId: (id: string) => Product | undefined;
  bySlug: (slug: string) => Product | undefined;
  byCategory: (slug: string, gender?: "mens" | "womens") => Product[];
  search: (query: string, limit?: number) => Product[];
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const value = useMemo<ProductsContextValue>(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    const slugMap = new Map(products.map((p) => [p.slug, p]));
    return {
      products,
      byId: (id) => map.get(id),
      bySlug: (slug) => slugMap.get(slug),
      byCategory: (slug, gender) =>
        products.filter((p) => {
          if (p.category !== slug) return false;
          if (gender && p.gender && p.gender !== gender) return false;
          return true;
        }),
      search: (query, limit = 8) => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return [];
        return products
          .filter((p) => {
            const hay = `${p.name} ${p.brand ?? ""} ${p.category} ${p.subCategory ?? ""}`.toLowerCase();
            return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
          })
          .slice(0, limit);
      },
    };
  }, [products]);

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
