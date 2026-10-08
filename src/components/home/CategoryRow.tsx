"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import type { Category } from "@/lib/categories";

/** Two rows on every breakpoint: 2×2 / 3×2 / 4×2 */
const MAX_ITEMS = 8;

export function CategoryRow({ category }: { category: Category }) {
  const { byCategory } = useProducts();
  const isFashion = category.slug === "fashion";
  const [gender, setGender] = useState<"mens" | "womens" | undefined>(
    isFashion ? "mens" : undefined,
  );
  const items = byCategory(category.slug, gender).slice(0, MAX_ITEMS);

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-ink/55">{category.blurb}</p>
        </div>
        <Link
          href={`/category/${category.slug}`}
          className="shrink-0 text-sm font-semibold text-ink hover:underline"
        >
          Shop all →
        </Link>
      </div>

      {isFashion && (
        <div className="mb-3 flex gap-2">
          {(["mens", "womens"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                gender === g
                  ? "bg-brand text-ink"
                  : "bg-ink/[0.05] text-ink/70 hover:bg-ink/10"
              }`}
            >
              {g === "mens" ? "Men's" : "Women's"}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">Products coming soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
