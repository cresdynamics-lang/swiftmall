import Link from "next/link";
import { listStoreCategories } from "@/lib/categories-db";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listStoreCategories();

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Shop by department</h1>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="rounded-xl bg-ink p-5 text-white transition hover:bg-ink/90"
          >
            <p className="font-display text-lg font-bold">{c.name}</p>
            <p className="mt-1 text-sm text-white/60">{c.blurb}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand">Shop all →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
