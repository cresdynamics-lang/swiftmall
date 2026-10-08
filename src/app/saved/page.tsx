"use client";

import Link from "next/link";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { useSaved } from "@/context/SavedContext";

export default function SavedPage() {
  const { byId } = useProducts();
  const { ids } = useSaved();
  const items = ids.map((id) => byId(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Saved items</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-10 text-center ring-1 ring-ink/8">
          <p className="text-ink/55">No saved items yet. Tap the heart on any product card.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className={`mt-6 ${PRODUCT_GRID_CLASS}`}>
          {items.map((p) => (
            <ProductCard key={p!.id} product={p!} />
          ))}
        </div>
      )}
    </div>
  );
}
