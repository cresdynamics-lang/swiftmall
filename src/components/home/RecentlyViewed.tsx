"use client";

import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useViewed } from "@/context/ViewedContext";

export function RecentlyViewed() {
  const { items, clear } = useViewed();
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-4 flex items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            Recently viewed
          </h2>
          <p className="mt-1 text-sm text-ink/55">Products you looked at on this device</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-ink/50 hover:text-ink"
        >
          Clear
        </button>
      </div>
      <div className={PRODUCT_GRID_CLASS}>
        {items.slice(0, 12).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
