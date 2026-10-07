"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useProducts } from "@/context/ProductsContext";

export type CartLine = { productId: string; qty: number; size?: string };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (productId: string, qty?: number, size?: string) => void;
  setQty: (productId: string, qty: number, size?: string) => void;
  remove: (productId: string, size?: string) => void;
  clear: () => void;
  qtyFor: (productId: string, size?: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "swiftmall-cart-v2";

function sameLine(a: CartLine, productId: string, size?: string) {
  return a.productId === productId && (a.size ?? "") === (size ?? "");
}

export function CartProvider({
  children,
  shippingFlatKes,
}: {
  children: ReactNode;
  shippingFlatKes: number;
}) {
  const { byId } = useProducts();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("swiftmall-cart");
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((productId: string, qty = 1, size?: string) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, productId, size));
      if (existing) {
        return prev.map((l) =>
          sameLine(l, productId, size) ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...prev, { productId, qty, size: size || undefined }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number, size?: string) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => !sameLine(l, productId, size));
      return prev.map((l) => (sameLine(l, productId, size) ? { ...l, qty } : l));
    });
  }, []);

  const remove = useCallback((productId: string, size?: string) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, productId, size)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const qtyFor = useCallback(
    (productId: string, size?: string) =>
      lines.find((l) => sameLine(l, productId, size))?.qty ?? 0,
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = byId(l.productId);
        return sum + (p?.price ?? 0) * l.qty;
      }, 0),
    [lines, byId],
  );

  const shipping = itemCount > 0 ? shippingFlatKes : 0;
  const total = subtotal + shipping;

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotal,
      shipping,
      total,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      setQty,
      remove,
      clear,
      qtyFor,
    }),
    [
      lines,
      itemCount,
      subtotal,
      shipping,
      total,
      drawerOpen,
      add,
      setQty,
      remove,
      clear,
      qtyFor,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
