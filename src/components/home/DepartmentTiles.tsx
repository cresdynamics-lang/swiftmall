"use client";

import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";

export function DepartmentTiles() {
  const categories = useCategories().filter((c) => c.slug !== "others");

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink/55">
        Shop by department
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="rounded-xl bg-ink px-3 py-4 text-center text-white transition hover:bg-ink/90"
          >
            <p className="font-display text-sm font-bold leading-snug">{c.shortName}</p>
            <p className="mt-1 line-clamp-2 text-[10px] text-white/55">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
