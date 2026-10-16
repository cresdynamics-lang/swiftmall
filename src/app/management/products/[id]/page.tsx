import Link from "next/link";
import { notFound } from "next/navigation";
import { duplicateProduct, requireAdmin } from "@/app/management/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";
import { getProductById } from "@/lib/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/management/products" className="text-sm text-ink/55 hover:text-ink">
          ← Products
        </Link>
        <form action={duplicateProduct}>
          <input type="hidden" name="id" value={product.id} />
          <button
            type="submit"
            className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/[0.04]"
          >
            Duplicate product
          </button>
        </form>
      </div>
      <div className="mt-4">
        <ProductForm product={product} categories={categories} />
      </div>
    </main>
  );
}
