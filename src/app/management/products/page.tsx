import { requireAdmin } from "@/app/management/actions";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { prisma } from "@/lib/db";
import { listAllProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  await requireAdmin();
  const [products, categories] = await Promise.all([
    listAllProducts(),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <ProductsTable products={products} categories={categories} />
    </main>
  );
}
