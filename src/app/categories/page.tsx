import Image from "next/image";
import Link from "next/link";
import { categoryImage } from "@/lib/categories";
import { listStoreCategories } from "@/lib/categories-db";

export const metadata = { title: "Categories" };

const RING: Record<string, string> = {
  "health-and-beauty": "ring-amber-400",
  "kitchen-and-home": "ring-sky-400",
  electronics: "ring-violet-400",
  "phones-and-accessories": "ring-amber-400",
  "gifts-and-accessories": "ring-sky-400",
  fashion: "ring-amber-400",
  others: "ring-ink/20",
};

export default async function CategoriesPage() {
  const categories = await listStoreCategories();

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Shop by department</h1>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
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
                className={`relative block aspect-square w-full max-w-[140px] overflow-hidden rounded-full bg-white ring-2 ${ring} transition duration-300 group-hover:scale-105 group-hover:shadow-lg`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-110"
                    sizes="140px"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center bg-ink px-2 font-display text-sm font-bold text-white">
                    {c.shortName}
                  </span>
                )}
              </span>
              <span className="mt-3 line-clamp-2 text-sm font-semibold text-ink">{c.name}</span>
              <span className="mt-0.5 line-clamp-2 text-xs text-ink/50">{c.blurb}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
