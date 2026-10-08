"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";

function DealsContent() {
  const { products } = useProducts();
  const params = useSearchParams();
  const tab = params.get("tab");

  const deals =
    tab === "new"
      ? products.filter((p) => p.offerTag === "NEW")
      : products.filter(
          (p) => p.flashDeal || (p.oldPrice != null && p.oldPrice > p.price),
        );

  const title = tab === "new" ? "What's New" : "Flash Sale";
  const blurb =
    tab === "new"
      ? "Fresh arrivals from the shop catalogue."
      : "Flash deals and discounted picks. Prices and savings come from the shop catalogue.";

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-ink/55">{blurb}</p>
      <div className={`mt-6 ${PRODUCT_GRID_CLASS}`}>
        {deals.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            variant={tab === "new" ? "default" : "flash"}
          />
        ))}
      </div>
      {deals.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink/50">Nothing here yet.</p>
      ) : null}
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-ink/50">Loading…</div>}>
      <DealsContent />
    </Suspense>
  );
}
