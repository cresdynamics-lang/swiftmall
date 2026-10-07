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
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink/55">
        Shop by department
      </h2>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6">
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
                className={`relative block aspect-square w-full max-w-[112px] overflow-hidden rounded-full bg-white ring-2 ${ring} transition duration-300 group-hover:scale-105 group-hover:shadow-lg group-active:scale-105 sm:max-w-[128px]`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    sizes="128px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center bg-ink px-2 font-display text-xs font-bold text-white">
                    {c.shortName}
                  </span>
                )}
              </span>
              <span className="mt-2 line-clamp-2 max-w-[7.5rem] text-[11px] font-semibold leading-snug text-ink sm:text-xs">
                {c.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
