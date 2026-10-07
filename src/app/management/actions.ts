"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gender, OfferTag, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureStoreSettings } from "@/lib/settings";

const AUTH_COOKIE = "swiftmall_admin";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expectedEmail = (
    process.env.ADMIN_EMAIL ?? "martin@swiftmall.co.ke"
  ).toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "Martin$100";

  if (email !== expectedEmail || password !== expectedPassword) {
    redirect("/management/login?error=1");
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/management");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete(AUTH_COOKIE);
  redirect("/management/login");
}

export async function requireAdmin() {
  const jar = await cookies();
  if (jar.get(AUTH_COOKIE)?.value !== "1") {
    redirect("/management/login");
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
  const { parseSizesFromForm } = await import("@/lib/product-sizes");
  const sizes = parseSizesFromForm(formData);
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
        sizes,
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
        sizes,
        categoryId: category.id,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/management");
  revalidatePath("/management/products");
  revalidatePath(`/category/${categorySlug}`);
  revalidatePath(`/product/${slug}`);
  redirect("/management/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/management/products");
  redirect("/management/products");
}

export async function toggleProductLive(id: string, live: boolean) {
  await requireAdmin();
  if (!id) return;
  await prisma.product.update({ where: { id }, data: { live } });
  revalidatePath("/");
  revalidatePath("/management");
  revalidatePath("/management/products");
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/management");
  revalidatePath("/management/orders");
  revalidatePath("/management/reports");
  revalidatePath("/management/customers");
}

export async function updateOrderNote(orderId: string, note: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { note } });
  revalidatePath("/management/orders");
}

export async function saveStoreSettings(formData: FormData) {
  await requireAdmin();
  await ensureStoreSettings();

  const carriersRaw = String(formData.get("carriers") ?? "");
  const carriers = carriersRaw
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  const flashRaw = String(formData.get("flashEndsAt") ?? "").trim();
  const flashEndsAt = flashRaw ? new Date(flashRaw) : null;

  await prisma.storeSettings.update({
    where: { id: "default" },
    data: {
      shippingFlatKes: Number(formData.get("shippingFlatKes") ?? 250),
      depositShare: Number(formData.get("depositShare") ?? 0.5),
      payOnOrder: formData.get("payOnOrder") === "on",
      depositEnabled: formData.get("depositEnabled") === "on",
      cashOnDelivery: formData.get("cashOnDelivery") === "on",
      payOnDelivery: formData.get("payOnDelivery") === "on",
      carriers,
      paybill: String(formData.get("paybill") ?? "").trim() || "880100",
      bankAccount: String(formData.get("bankAccount") ?? "").trim() || "9211670018",
      whatsappNumber: String(formData.get("whatsappNumber") ?? "").trim(),
      phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
      contactEmail: String(formData.get("contactEmail") ?? "").trim(),
      flashEndsAt:
        flashEndsAt && !Number.isNaN(flashEndsAt.getTime()) ? flashEndsAt : null,
    },
  });

  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/management/payments");
  revalidatePath("/management/settings");
  const redirectTo = String(formData.get("redirectTo") ?? "/management/payments");
  redirect(redirectTo.startsWith("/management/") ? redirectTo : "/management/payments");
}

export async function publishBanner(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const headline = String(formData.get("headline") ?? "").trim();
  const subheadline = String(formData.get("subheadline") ?? "").trim();
  const copy = String(formData.get("copy") ?? "").trim();
  const ctaLabel = String(formData.get("ctaLabel") ?? "Shop now →").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const tile1ProductId = String(formData.get("tile1ProductId") ?? "") || null;
  const tile2ProductId = String(formData.get("tile2ProductId") ?? "") || null;

  if (!headline) throw new Error("Headline required");

  if (id) {
    await prisma.homepageBanner.update({
      where: { id },
      data: {
        headline,
        subheadline,
        copy,
        ctaLabel,
        categoryId,
        tile1ProductId,
        tile2ProductId,
        active: true,
      },
    });
  } else {
    await prisma.homepageBanner.create({
      data: {
        headline,
        subheadline,
        copy,
        ctaLabel,
        categoryId,
        tile1ProductId,
        tile2ProductId,
        active: true,
        sortOrder: 0,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/management/banners");
  redirect("/management/banners");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const shortName = String(formData.get("shortName") ?? "").trim() || name;
  const blurb = String(formData.get("blurb") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  if (!name || !slug) throw new Error("Name required");

  if (id) {
    await prisma.category.update({
      where: { id },
      data: { name, shortName, blurb, slug },
    });
  } else {
    const max = await prisma.category.aggregate({ _max: { sortOrder: true } });
    await prisma.category.create({
      data: {
        name,
        shortName,
        blurb: blurb || "Shop this department.",
        slug,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/management/categories");
  redirect("/management/categories");
}

export async function moveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  if (index < 0) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= categories.length) return;

  const a = categories[index];
  const b = categories[swapWith];
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.category.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidatePath("/");
  revalidatePath("/management/categories");
  redirect("/management/categories");
}
