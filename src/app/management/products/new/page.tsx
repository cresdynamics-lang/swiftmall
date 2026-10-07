import Link from "next/link";
import { requireAdmin } from "@/app/management/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/management/products" className="text-sm text-ink/55 hover:text-ink">
        ← Products
      </Link>
      <div className="mt-4">
        <ProductForm categories={categories} />
      </div>
    </main>
  );
}
