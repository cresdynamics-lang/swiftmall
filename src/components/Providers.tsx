"use client";

import { CartProvider } from "@/context/CartContext";
import { SavedProvider } from "@/context/SavedContext";
import { ViewedProvider } from "@/context/ViewedContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SavedProvider>
        <ViewedProvider>{children}</ViewedProvider>
      </SavedProvider>
    </CartProvider>
  );
}
