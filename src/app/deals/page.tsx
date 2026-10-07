"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";

export default function DealsPage() {
  const { products } = useProducts();
  const deals = products.filter(
    (p) => p.flashDeal || (p.oldPrice != null && p.oldPrice > p.price),
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Deals</h1>
      <p className="mt-1 text-sm text-ink/55">
        Flash deals and discounted picks. Prices and savings come from the shop catalogue.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} variant="flash" />
        ))}
      </div>
    </div>
  );
}
