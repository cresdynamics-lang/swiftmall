import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getCategory } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gender?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cat = getCategory(slug);
  return { title: cat?.name ?? "Category" };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { gender: genderParam } = await searchParams;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const gender =
    genderParam === "mens" || genderParam === "womens" ? genderParam : undefined;
  const items = getProductsByCategory(slug, gender);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <nav className="mb-3 text-sm text-ink/50">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">{cat.name}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{cat.name}</h1>
          <p className="mt-1 text-sm text-ink/55">
            {items.length} products · all with cash on delivery
          </p>
        </div>
        {cat.children && (
          <div className="flex gap-2">
            <Link
              href={`/category/${slug}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                !gender ? "bg-brand text-ink" : "bg-white text-ink/70 ring-1 ring-ink/10"
              }`}
            >
              All
            </Link>
            {cat.children.map((c) => {
              const g = c.slug.includes("mens") ? "mens" : "womens";
              return (
                <Link
                  key={c.slug}
                  href={`/category/${slug}?gender=${g}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    gender === g
                      ? "bg-brand text-ink"
                      : "bg-white text-ink/70 ring-1 ring-ink/10"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-10 text-center text-sm text-ink/55 ring-1 ring-ink/8">
          No products in this view yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
