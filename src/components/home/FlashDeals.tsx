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
  const deals = products.filter((p) => p.flashDeal || p.offerTag !== "NONE").slice(0, 12);
  const clock = useCountdown(2);
  const mid = Math.ceil(deals.length / 2);
  const rows = [deals.slice(0, mid), deals.slice(mid)].filter((r) => r.length > 0);

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">Flash deals</h2>
          <p className="mt-1 text-sm text-ink/55">
            Ends in <span className="font-semibold text-ink">{clock}</span>
          </p>
        </div>
        <Link href="/deals" className="shrink-0 text-sm font-semibold text-ink hover:underline">
          Shop all →
        </Link>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={`flash-row-${i}`}
            className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] snap-x snap-mandatory"
          >
            {row.map((p) => (
              <div
                key={p.id}
                className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[28%] lg:w-[23%]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
