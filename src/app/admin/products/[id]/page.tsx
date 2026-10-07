import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
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
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ProductForm product={product} categories={categories} />
      </main>
    </>
  );
}
