"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/product-types";

const ROW_COUNT = 2;
const PER_ROW = 8;

function ScrollRow({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 pt-0.5 [scrollbar-width:thin] snap-x snap-mandatory">
      {products.map((p) => (
        <div
          key={p.id}
          className="w-[46%] shrink-0 snap-start sm:w-[31%] md:w-[28%] lg:w-[23%]"
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

export function CategoryRow({ category }: { category: Category }) {
  const { byCategory } = useProducts();
  const isFashion = category.slug === "fashion";
  const [gender, setGender] = useState<"mens" | "womens" | undefined>(
    isFashion ? "mens" : undefined,
  );
  const items = byCategory(category.slug, gender).slice(0, ROW_COUNT * PER_ROW);
  const rows = Array.from({ length: ROW_COUNT }, (_, i) =>
    items.slice(i * PER_ROW, (i + 1) * PER_ROW),
  ).filter((row) => row.length > 0);

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

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">Products coming soon.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <ScrollRow key={`${category.slug}-row-${i}`} products={row} />
          ))}
        </div>
      )}
    </section>
  );
}
