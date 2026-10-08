"use client";

import Image from "next/image";
import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { categoryImage } from "@/lib/categories";

export function DepartmentTiles() {
  const categories = useCategories().filter((c) => c.slug !== "others");

  return (
    <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink/55">
        Shop by department
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => {
          const src = c.image ?? categoryImage(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative block aspect-[5/6] overflow-hidden rounded-xl bg-ink ring-1 ring-ink/10 transition duration-300 hover:shadow-lg hover:ring-brand sm:aspect-[4/5]"
            >
              {src ? (
                <Image
                  src={src}
                  alt={c.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 180px"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-ink px-2 font-display text-sm font-bold text-white">
                  {c.shortName}
                </span>
              )}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black via-black/75 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-6">
                <span className="line-clamp-2 text-left text-[12px] font-semibold leading-snug text-white sm:text-sm">
                  {c.name}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
