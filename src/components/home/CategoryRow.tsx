"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import type { Category } from "@/lib/categories";

export function CategoryRow({ category }: { category: Category }) {
  const { byCategory } = useProducts();
  const isFashion = category.slug === "fashion";
  const [gender, setGender] = useState<"mens" | "womens" | undefined>(
    isFashion ? "mens" : undefined,
  );
  const items = byCategory(category.slug, gender).slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
        <div className="grid lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col justify-between bg-ink p-5 text-white">
            <div>
              <h2 className="font-display text-xl font-bold leading-tight">{category.name}</h2>
              <p className="mt-2 text-sm text-white/65">{category.blurb}</p>
            </div>
            <Link
              href={`/category/${category.slug}`}
              className="mt-6 inline-flex w-fit rounded-md bg-brand px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Shop all →
            </Link>
          </div>

          <div className="p-3 sm:p-4">
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
              <div className="grid grid-cols-2 gap-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
