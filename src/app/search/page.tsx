"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const { products, search } = useProducts();
  const results = q.trim().length >= 2 ? search(q, 48) : products.slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">
        {q ? `Results for "${q}"` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-ink/55">{results.length} products</p>
      <div className={`mt-6 ${PRODUCT_GRID_CLASS}`}>
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-ink/50">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
