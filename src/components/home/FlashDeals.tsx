"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { discountPercent } from "@/lib/format";

function useRealCountdown(endsAt: string | null) {
  const end = endsAt ? new Date(endsAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(end) || end <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  if (!Number.isFinite(end)) return null;
  const remaining = Math.max(0, Math.floor((end - now) / 1000));
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { remaining, h, m, s, ended: remaining <= 0 };
}

export function FlashDeals({ flashEndsAt }: { flashEndsAt: string | null }) {
  const { products } = useProducts();
  const clock = useRealCountdown(flashEndsAt);

  const deals = useMemo(() => {
    const marked = products.filter((p) => p.flashDeal && p.live !== false);
    const list =
      marked.length > 0
        ? marked
        : products.filter(
            (p) => p.oldPrice != null && p.oldPrice > p.price,
          );
    return [...list].sort((a, b) => {
      const da = discountPercent(a.price, a.oldPrice) ?? 0;
      const db = discountPercent(b.price, b.oldPrice) ?? 0;
      return db - da;
    });
  }, [products]);

  if (!flashEndsAt || clock?.ended) {
    return (
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <div className="rounded-[18px] bg-ink px-4 py-8 text-center text-white sm:px-6">
          <h2 className="font-display text-xl font-bold">⚡ Flash Sale</h2>
          <p className="mt-2 text-sm text-white/60">New deals soon</p>
          <Link
            href="/deals"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Browse deals →
          </Link>
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="rounded-[18px] bg-ink px-3 py-4 text-white sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              ⚡ Flash Sale
            </h2>
            <span className="rounded bg-brand px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
              Deal of the hour
            </span>
            <Link
              href="/deals"
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Shop all →
            </Link>
          </div>
        </div>

        {/* One equal-card row: 3 on small screens, 6 on desktop; scroll if more */}
        <div className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:gap-2.5 lg:gap-3">
          {deals.map((p) => (
            <div
              key={p.id}
              className="w-[calc((100%-1rem)/3)] min-w-[calc((100%-1rem)/3)] shrink-0 sm:w-[calc((100%-1.25rem)/3)] sm:min-w-[calc((100%-1.25rem)/3)] lg:w-[calc((100%-3.75rem)/6)] lg:min-w-[calc((100%-3.75rem)/6)]"
            >
              <ProductCard product={p} variant="flash" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
