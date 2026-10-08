"use client";

import Link from "next/link";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";

export function WhatsNewRow() {
  const { products } = useProducts();
  const items = products.filter((p) => p.offerTag === "NEW").slice(0, 12);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">What&apos;s New</h2>
        <Link href="/deals?tab=new" className="text-sm font-semibold text-ink hover:underline">
          See all →
        </Link>
      </div>
      <div className={PRODUCT_GRID_CLASS}>
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
