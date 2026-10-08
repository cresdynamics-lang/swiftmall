"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
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
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] snap-x snap-mandatory">
        {items.map((p) => (
          <div
            key={p.id}
            className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[23%] lg:w-[18%]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
