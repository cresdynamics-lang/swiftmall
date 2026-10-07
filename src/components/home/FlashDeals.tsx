"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";

function useCountdown(hoursFromNow = 2) {
  const [remaining, setRemaining] = useState(hoursFromNow * 3600);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return `${h} ${m} ${s}`;
}

export function FlashDeals() {
  const { products } = useProducts();
  const deals = products.filter((p) => p.flashDeal || p.offerTag !== "NONE").slice(0, 4);
  const clock = useCountdown(2);

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Flash deals</h2>
          <p className="mt-1 text-sm text-ink/55">
            Ends in <span className="font-semibold text-ink">{clock}</span>
          </p>
        </div>
        <Link href="/deals" className="text-sm font-semibold text-ink hover:underline">
          See all deals →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {deals.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
