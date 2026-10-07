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
import type { Product } from "@/lib/product-types";

type ViewedContextValue = {
  ids: string[];
  items: Product[];
  track: (productId: string) => void;
  clear: () => void;
};

const ViewedContext = createContext<ViewedContextValue | null>(null);
const STORAGE_KEY = "swiftmall-viewed";
const MAX = 12;

export function ViewedProvider({ children }: { children: ReactNode }) {
  const { byId } = useProducts();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const track = useCallback((productId: string) => {
    setIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)];
      return next.slice(0, MAX);
    });
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const items = useMemo(
    () => ids.map((id) => byId(id)).filter(Boolean) as Product[],
    [ids, byId],
  );

  const value = useMemo(
    () => ({ ids, items, track, clear }),
    [ids, items, track, clear],
  );

  return (
    <ViewedContext.Provider value={value}>{children}</ViewedContext.Provider>
  );
}

export function useViewed() {
  const ctx = useContext(ViewedContext);
  if (!ctx) throw new Error("useViewed must be used within ViewedProvider");
  return ctx;
}
