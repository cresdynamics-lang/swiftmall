import { prisma } from "@/lib/db";
import {
  CATEGORY_IMAGES,
  categories as staticCategories,
  type Category,
} from "@/lib/categories";

const childrenBySlug = Object.fromEntries(
  staticCategories.map((c) => [c.slug, c.children]),
);

export async function listStoreCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  if (!rows.length) return staticCategories;

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    blurb: r.blurb,
    image: CATEGORY_IMAGES[r.slug],
    children: childrenBySlug[r.slug],
  }));
}

export async function getStoreCategory(slug: string): Promise<Category | undefined> {
  const all = await listStoreCategories();
  return all.find((c) => c.slug === slug);
}
