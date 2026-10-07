import { requireAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ProductForm categories={categories} />
      </main>
    </>
  );
}
