"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gender, OfferTag } from "@prisma/client";
import { prisma } from "@/lib/db";

const AUTH_COOKIE = "swiftmall_admin";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "swiftmall-admin";
  if (password !== expected) {
    redirect("/admin/login?error=1");
  }
  const jar = await cookies();
  jar.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  redirect("/admin/login");
}

export async function requireAdmin() {
  const jar = await cookies();
  if (jar.get(AUTH_COOKIE)?.value !== "1") {
    redirect("/admin/login");
  }
}

function parseOfferTag(raw: FormDataEntryValue | null): OfferTag {
  const v = String(raw ?? "NONE");
  if (v === "TODAY" || v === "THIS_WEEK" || v === "NEW" || v === "NONE") return v;
  return OfferTag.NONE;
}

function parseGender(raw: FormDataEntryValue | null): Gender | null {
  const v = String(raw ?? "");
  if (v === "MENS") return Gender.MENS;
  if (v === "WOMENS") return Gender.WOMENS;
  return null;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const subCategory = String(formData.get("subCategory") ?? "").trim() || null;
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const oldPriceRaw = String(formData.get("oldPrice") ?? "").trim();
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  const stock = Number(formData.get("stock") ?? 0);
  const lowStockAt = Number(formData.get("lowStockAt") ?? 3);
  const image = String(formData.get("image") ?? "").trim();
  const images = image ? [image] : [];
  const flashDeal = formData.get("flashDeal") === "on";
  const featured = formData.get("featured") === "on";
  const live = formData.get("live") === "on";
  const offerTag = parseOfferTag(formData.get("offerTag"));
  const gender = parseGender(formData.get("gender"));
  let slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name || !categorySlug || !price) {
    throw new Error("Name, category and price are required");
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) throw new Error("Category not found");

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        brand,
        subCategory,
        sku,
        price,
        oldPrice,
        stock,
        lowStockAt,
        images,
        flashDeal,
        featured,
        live,
        offerTag,
        gender,
        categoryId: category.id,
      },
    });
  } else {
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;
    await prisma.product.create({
      data: {
        name,
        slug,
        description,
        brand,
        subCategory,
        sku,
        price,
        oldPrice,
        stock,
        lowStockAt,
        images,
        flashDeal,
        featured,
        live,
        offerTag,
        gender,
        categoryId: category.id,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath(`/category/${categorySlug}`);
  revalidatePath(`/product/${slug}`);
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
