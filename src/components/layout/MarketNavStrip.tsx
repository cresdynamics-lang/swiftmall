"use client";

import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";

export function MarketNavStrip() {
  const categories = useCategories();
  const { products } = useProducts();
  const depts = categories.filter(
    (c) => c.slug !== "others" && products.some((p) => p.category === c.slug),
  );

  return (
    <div className="border-b border-ink/10 bg-white">
      <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3 py-2.5 [scrollbar-width:thin] sm:gap-2 sm:px-4 lg:gap-3 lg:px-6 lg:py-3">
        <Link
          href="/deals?tab=new"
          className="inline-flex shrink-0 items-center rounded-md px-2.5 py-2 text-sm font-bold text-ink hover:bg-ink/[0.04] sm:px-3 sm:text-base lg:px-4 lg:text-lg xl:text-xl"
        >
          What&apos;s New
        </Link>
        <Link
          href="/deals"
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand px-2.5 py-2 text-sm font-bold text-ink hover:bg-brand-dark sm:px-3 sm:text-base lg:px-4 lg:text-lg xl:text-xl"
        >
          <span aria-hidden>⚡</span> Flash Sale
        </Link>
        <span className="mx-1 hidden h-6 w-px shrink-0 bg-ink/15 lg:block" aria-hidden />
        {depts.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="inline-flex shrink-0 items-center rounded-md px-2.5 py-2 text-sm font-bold text-ink/85 hover:bg-ink/[0.04] hover:text-ink sm:px-3 sm:text-base lg:px-4 lg:text-lg xl:text-xl"
          >
            {c.shortName}
          </Link>
        ))}
      </div>
    </div>
  );
}
