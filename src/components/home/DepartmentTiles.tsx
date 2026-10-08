"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { categoryImage } from "@/lib/categories";

const RING: Record<string, string> = {
  "health-and-beauty": "ring-amber-400",
  "kitchen-and-home": "ring-sky-400",
  electronics: "ring-violet-400",
  "phones-and-accessories": "ring-amber-400",
  "gifts-and-accessories": "ring-sky-400",
  fashion: "ring-amber-400",
};

export function DepartmentTiles() {
  const categories = useCategories().filter((c) => c.slug !== "others");

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-ink/55 sm:text-sm">
        Shop by department
      </h2>
      <div
        className="grid gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4"
        style={{
          gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {categories.map((c) => {
          const src = c.image ?? categoryImage(c.slug);
          const ring = RING[c.slug] ?? "ring-brand";
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <span
                className={`relative mx-auto block aspect-square w-full max-w-[72px] overflow-hidden rounded-full bg-white ring-2 ${ring} transition duration-300 group-hover:scale-105 group-hover:shadow-md sm:max-w-[96px] md:max-w-[112px]`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    sizes="112px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center bg-ink px-1 font-display text-[9px] font-bold text-white sm:text-xs">
                    {c.shortName}
                  </span>
                )}
              </span>
              <span className="mt-1.5 line-clamp-2 max-w-[5.5rem] text-[9px] font-semibold leading-tight text-ink sm:mt-2 sm:max-w-[7rem] sm:text-[11px] md:text-xs">
                {c.shortName}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
