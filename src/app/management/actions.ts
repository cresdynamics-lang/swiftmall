"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Gender, OfferTag, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureStoreSettings } from "@/lib/settings";

const AUTH_COOKIE = "swiftmall_admin";

/**
 * Read admin credentials at runtime (dynamic keys + optional file) so Next
 * cannot bake a wrong value at build time — `$` in passwords breaks .env expand.
 */
async function getAdminCredentials() {
  const emailKey = ["ADMIN", "EMAIL"].join("_");
  const passKey = ["ADMIN", "PASSWORD"].join("_");
  let email = (process.env[emailKey] ?? "martin@swiftmall.co.ke").toLowerCase();
  let password = process.env[passKey] ?? "";

  if (!password) {
    try {
      const { readFile } = await import("fs/promises");
      const { join } = await import("path");
      password = (
        await readFile(join(process.cwd(), ".admin-password"), "utf8")
      ).trim();
    } catch {
      password = "Martin100";
    }
  }

  // Normalize legacy $ passwords that Next/.env often strip or escape
  if (
    password === "Martin" ||
    password === String.raw`Martin\$100` ||
    password === "Martin$100"
  ) {
    password = "Martin100";
  }

  return { email, password };
}

function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  let password = String(formData.get("password") ?? "");
  // Accept legacy Martin$100 entries (shells/.env often break the `$`)
  if (password === "Martin$100" || password === String.raw`Martin\$100`) {
    password = "Martin100";
  }
  const expected = await getAdminCredentials();

  if (email !== expected.email || password !== expected.password) {
    redirect("/management/login?error=1");
  }

  const jar = await cookies();
  jar.set(AUTH_COOKIE, "1", adminCookieOptions());
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
  if (v === "UNISEX") return Gender.UNISEX;
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
  const flashDeal = formData.get("flashDeal") === "on";
  const featured = formData.get("featured") === "on";
  const live = formData.get("live") === "on";
  const offerTag = parseOfferTag(formData.get("offerTag"));
  const gender = parseGender(formData.get("gender"));
  const { parseSizesFromForm, isShoeSizeLabel } = await import("@/lib/product-sizes");
  const {
    parseSizePricesFromForm,
    defaultShoeSizePrices,
    sizePricesAreFlat,
  } = await import("@/lib/product-price");
  const sizes = parseSizesFromForm(formData);
  let sizePrices = parseSizePricesFromForm(formData, sizes);
  const shoeSizes = sizes.filter(isShoeSizeLabel);
  if (shoeSizes.length >= 2 && (!sizePrices || sizePricesAreFlat(sizePrices))) {
    const base =
      (sizePrices ? Object.values(sizePrices)[0] : 0) || price || 0;
    if (base > 0) sizePrices = defaultShoeSizePrices(base, shoeSizes);
  }
  let slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  if (!name || !categorySlug || (!price && !sizePrices)) {
    throw new Error("Name, category and price are required");
  }

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) throw new Error("Category not found");

  if (categorySlug === "fashion" && !gender) {
    throw new Error("Fashion products need Men's, Women's or Unisex so filters work");
  }

  const { MAX_PRODUCT_IMAGES } = await import("@/lib/product-types");
  const { saveProductImageFile, saveProductImageFiles } = await import(
    "@/lib/product-image"
  );

  const keepDisplay = String(formData.get("keepDisplay") ?? "").trim();
  const keepAngles = formData
    .getAll("keepAngles")
    .map((v) => String(v).trim())
    .filter((v) => v.startsWith("/") && !v.includes(".."));

  // Legacy combined keepImages (display first, then angles)
  const legacyKept = formData
    .getAll("keepImages")
    .map((v) => String(v).trim())
    .filter((v) => v.startsWith("/") && !v.includes(".."));

  const displayFile =
    formData.get("displayImageFile") instanceof File
      ? (formData.get("displayImageFile") as File)
      : formData.get("imageFile") instanceof File
        ? (formData.get("imageFile") as File)
        : null;
  const angleFiles = [
    ...formData.getAll("angleFiles"),
    ...formData.getAll("imageFiles"),
  ].filter((v): v is File => v instanceof File && v.size > 0);

  let displayPath: string | null =
    keepDisplay.startsWith("/") && !keepDisplay.includes("..")
      ? keepDisplay
      : legacyKept[0] ?? null;
  if (displayFile && displayFile.size > 0) {
    displayPath = (await saveProductImageFile(displayFile)) ?? displayPath;
  }

  const baseAngles =
    keepAngles.length > 0
      ? keepAngles
      : legacyKept.length > 1
        ? legacyKept.slice(1)
        : [];
  const uploadedAngles = await saveProductImageFiles(angleFiles);
  const images = [
    ...(displayPath ? [displayPath] : []),
    ...baseAngles,
    ...uploadedAngles,
  ].slice(0, MAX_PRODUCT_IMAGES);

  if (!images.length) {
    throw new Error("Upload a display image before saving");
  }
  if (!displayPath) {
    throw new Error("Upload a display image before saving");
  }

  const data = {
    name,
    slug,
    description,
    brand,
    subCategory,
    sku,
    price: sizePrices ? Math.min(...Object.values(sizePrices)) : price,
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
    sizePrices: sizePrices ?? Prisma.DbNull,
    categoryId: category.id,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    // Double-submit / retry: update the existing row instead of creating
    // timestamp-suffixed duplicates with the same name and image.
    const existing =
      (await prisma.product.findUnique({ where: { slug } })) ??
      (await prisma.product.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      }));

    if (existing) {
      slug = existing.slug;
      await prisma.product.update({
        where: { id: existing.id },
        data: { ...data, slug: existing.slug },
      });
    } else {
      await prisma.product.create({ data });
    }
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

/** Clone a product (same photos/sizes/prices) for quick CRUD copies. */
export async function duplicateProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Product id required");

  const source = await prisma.product.findUnique({ where: { id } });
  if (!source) throw new Error("Product not found");

  const baseSlug = `${source.slug}-copy`.slice(0, 72);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n}`.slice(0, 80);
    n += 1;
  }

  const copyName = source.name.endsWith(" (copy)")
    ? `${source.name} ${n}`
    : `${source.name} (copy)`;

  const created = await prisma.product.create({
    data: {
      name: copyName,
      slug,
      description: source.description,
      brand: source.brand,
      subCategory: source.subCategory,
      sku: source.sku ? `${source.sku}-COPY` : null,
      price: source.price,
      oldPrice: source.oldPrice,
      stock: source.stock,
      lowStockAt: source.lowStockAt,
      images: source.images,
      flashDeal: false,
      featured: false,
      live: false,
      offerTag: "NEW",
      gender: source.gender,
      sizes: source.sizes,
      sizePrices: source.sizePrices ?? undefined,
      categoryId: source.categoryId,
      sortOrder: source.sortOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/management");
  revalidatePath("/management/products");
  redirect(`/management/products/${created.id}`);
}

export async function toggleProductLive(id: string, live: boolean) {
  await requireAdmin();
  if (!id) return;
  await prisma.product.update({ where: { id }, data: { live } });
  revalidatePath("/");
  revalidatePath("/management");
  revalidatePath("/management/products");
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  opts?: { customerNote?: string; notify?: boolean; actor?: string },
) {
  await requireAdmin();
  const notify = opts?.notify !== false;
  const actor = opts?.actor ?? "admin";
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      customerNote: opts?.customerNote?.trim() || undefined,
      events: {
        create: {
          status,
          note: opts?.customerNote?.trim() || "",
          actor,
          notify,
        },
      },
    },
    include: { items: true, events: true },
  });
  await prisma.auditLog.create({
    data: {
      actor,
      action: `status:${status}`,
      detail: opts?.customerNote?.trim() || "",
      orderId,
    },
  });
  if (notify) {
    const { shouldEmailForStatus, queueCustomerOrderEmail } = await import(
      "@/lib/order-emails"
    );
    const kind = shouldEmailForStatus(status);
    if (kind) void queueCustomerOrderEmail(order, kind);
  }
  if (status === "CUSTOMER_UNREACHABLE" || status === "DELIVERY_REFUSED") {
    await prisma.adminAlert.create({
      data: {
        type: status === "CUSTOMER_UNREACHABLE" ? "unreachable" : "refused",
        title: `Order #${order.number}: ${status}`,
        href: `/management/orders?id=${orderId}`,
        orderId,
      },
    });
  }
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

/** Only admin confirms payment — never from customer claim alone. */
export async function confirmOrderPayment(
  orderId: string,
  amountReceived: number,
  actor = "admin",
) {
  await requireAdmin();
  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) throw new Error("Order not found");
  const amount = Math.max(0, Math.round(amountReceived));
  const isDeposit = current.paymentMethod === "DEPOSIT";
  const fullyPaid = !isDeposit || amount >= current.total;
  const partPaid = isDeposit && amount > 0 && amount < current.total;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      amountConfirmed: amount,
      depositPaid: isDeposit ? Math.min(amount, current.amountExpected || amount) : amount,
      paymentState: fullyPaid ? "PAID" : partPaid ? "PART_PAID" : current.paymentState,
    },
    include: { items: true },
  });
  await prisma.auditLog.create({
    data: {
      actor,
      action: "payment_confirm",
      detail: `KES ${amount}`,
      orderId,
    },
  });
  const { queueCustomerOrderEmail } = await import("@/lib/order-emails");
  void queueCustomerOrderEmail(order, "payment");
  revalidatePath("/management/orders");
}

export async function recordCashCollected(
  orderId: string,
  amount: number,
  actor = "admin",
) {
  await requireAdmin();
  const amt = Math.max(0, Math.round(amount));
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      cashCollected: amt,
      cashCollectedBy: actor,
      cashCollectedAt: new Date(),
      amountConfirmed: amt,
      paymentState: "PAID",
    },
    include: { items: true },
  });
  await prisma.auditLog.create({
    data: {
      actor,
      action: "cash_collected",
      detail: `KES ${amt}`,
      orderId,
    },
  });
  const { queueCustomerOrderEmail } = await import("@/lib/order-emails");
  void queueCustomerOrderEmail(order, "payment");
  revalidatePath("/management/orders");
}

export async function saveRiderDetails(
  orderId: string,
  riderName: string,
  riderPhone: string,
) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      riderName: riderName.trim(),
      riderPhone: riderPhone.trim(),
    },
  });
  await prisma.auditLog.create({
    data: {
      actor: "admin",
      action: "rider_update",
      detail: `${riderName} ${riderPhone}`.trim(),
      orderId,
    },
  });
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

  const { saveHeroImageFile } = await import("@/lib/hero-image");
  const uploaded = await saveHeroImageFile(
    formData.get("imageFile") instanceof File
      ? (formData.get("imageFile") as File)
      : null,
  );

  const existing = id
    ? await prisma.homepageBanner.findUnique({
        where: { id },
        select: { backgroundImage: true },
      })
    : null;
  const backgroundImage = uploaded ?? existing?.backgroundImage ?? null;

  const data = {
    headline,
    subheadline,
    copy,
    ctaLabel,
    backgroundImage,
    categoryId,
    tile1ProductId,
    tile2ProductId,
    active: true,
  };

  if (id) {
    await prisma.homepageBanner.update({ where: { id }, data });
  } else {
    await prisma.homepageBanner.create({
      data: { ...data, sortOrder: 0 },
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
