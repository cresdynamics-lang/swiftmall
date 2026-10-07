"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Category } from "@/lib/categories";

const CategoriesContext = createContext<Category[]>([]);

export function CategoriesProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  return (
    <CategoriesContext.Provider value={categories}>{children}</CategoriesContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoriesContext);
}
