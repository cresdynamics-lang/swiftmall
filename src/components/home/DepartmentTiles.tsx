"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { categoryImage } from "@/lib/categories";

export function DepartmentTiles() {
  const categories = useCategories().filter((c) => c.slug !== "others");

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <h2 className="mb-2.5 font-display text-xs font-bold uppercase tracking-wide text-ink/55 sm:text-sm">
        Shop by department
      </h2>
      <div
        className="grid gap-1.5 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {categories.map((c) => {
          const src = c.image ?? categoryImage(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative block aspect-[5/4] overflow-hidden rounded-md bg-ink ring-1 ring-ink/10 transition duration-300 hover:shadow-md hover:ring-brand sm:aspect-[4/3] sm:rounded-lg"
            >
              {src ? (
                <Image
                  src={src}
                  alt={c.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 16vw, 140px"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-ink px-1 font-display text-[9px] font-bold text-white sm:text-xs">
                  {c.shortName}
                </span>
              )}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 px-1 pb-1 pt-3 sm:px-1.5 sm:pb-1.5">
                <span className="line-clamp-2 text-center text-[8px] font-semibold leading-tight text-white sm:text-[10px] md:text-[11px]">
                  {c.shortName}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
