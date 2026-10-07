import { ProductCard } from "@/components/product/ProductCard";
import { searchProducts, products } from "@/lib/products";

type PageProps = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const results = q.trim().length >= 2 ? searchProducts(q, 48) : products.slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-ink/55">{results.length} products</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
