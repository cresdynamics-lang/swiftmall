import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { getStoreCategory } from "@/lib/categories-db";
import { CATEGORY_SUB_OPTIONS } from "@/lib/category-subs";
import { getProductsByCategory } from "@/lib/products";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gender?: string; g?: string; sub?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getStoreCategory(slug);
  return { title: cat?.name ?? "Category" };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = await getStoreCategory(slug);
  if (!cat) notFound();

  const genderRaw = sp.gender ?? sp.g;
  const gender =
    genderRaw === "mens" || genderRaw === "womens" ? genderRaw : undefined;
  const sub = sp.sub?.trim() || undefined;
  const items = await getProductsByCategory(slug, gender, sub);

  const isFashion = slug === "fashion";
  const subOptions = CATEGORY_SUB_OPTIONS[slug] ?? [];

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

        {isFashion ? (
          <div className="flex gap-2">
            <Chip href={`/category/${slug}`} active={!gender}>
              All
            </Chip>
            <Chip href={`/category/${slug}?gender=mens`} active={gender === "mens"}>
              Men&apos;s
            </Chip>
            <Chip href={`/category/${slug}?gender=womens`} active={gender === "womens"}>
              Women&apos;s
            </Chip>
          </div>
        ) : subOptions.length ? (
          <div className="flex flex-wrap gap-2">
            <Chip href={`/category/${slug}`} active={!sub}>
              All
            </Chip>
            {subOptions.map((o) => (
              <Chip
                key={o.slug}
                href={`/category/${slug}?sub=${o.slug}`}
                active={sub === o.slug}
              >
                {o.label}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-white p-10 text-center text-sm text-ink/55 ring-1 ring-ink/8">
          No products in this view yet.
        </p>
      ) : (
        <div className={PRODUCT_GRID_CLASS}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? "bg-brand text-ink" : "bg-white text-ink/70 ring-1 ring-ink/10"
      }`}
    >
      {children}
    </Link>
  );
}
