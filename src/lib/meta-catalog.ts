import { business } from "@/lib/business";
import { priceForProduct } from "@/lib/product-price";
import type { Product } from "@/lib/product-types";

/** Meta Commerce Manager scheduled CSV feed URL (absolute). */
export const META_CATALOG_FEED_PATH = "/feeds/meta-catalog.csv";
export const META_CATALOG_FEED_URL = `${business.url}${META_CATALOG_FEED_PATH}`;

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  "health-and-beauty": "Health & Beauty",
  "kitchen-and-home": "Home & Garden > Kitchen & Dining",
  electronics: "Electronics",
  "phones-and-accessories": "Electronics > Communications > Telephony > Mobile Phones",
  "gifts-and-accessories": "Arts & Entertainment > Party & Celebration > Gift Giving",
  fashion: "Apparel & Accessories",
  others: "Home & Garden",
};

export function catalogItemId(productId: string, size?: string | null): string {
  if (!size) return productId;
  const slug = size
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${productId}_${slug}` : productId;
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function absoluteImage(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${business.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function genderForMeta(gender?: Product["gender"]): string {
  if (gender === "mens") return "male";
  if (gender === "womens") return "female";
  if (gender === "unisex") return "unisex";
  return "";
}

type CatalogRow = Record<string, string>;

const HEADERS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "additional_image_link",
  "google_product_category",
  "product_type",
  "sale_price",
  "item_group_id",
  "size",
  "gender",
  "quantity_to_sell_on_facebook",
  "status",
] as const;

function productRows(p: Product): CatalogRow[] {
  const image = p.images[0];
  const desc = (p.description ?? "").trim() || p.name;
  if (!image || !p.price || p.price <= 0) return [];

  const brand = (p.brand || business.brandName).trim();
  const baseLink = `${business.url}/product/${p.slug}`;
  // Display image + angles stay on one feed row (not separate products).
  const imageLink = absoluteImage(image);
  const additional = p.images
    .slice(1, 5)
    .map(absoluteImage)
    .join(",");
  const gpc = GOOGLE_PRODUCT_CATEGORY[p.category] ?? "Home & Garden";
  const gender = genderForMeta(p.gender);
  const availability = p.stock > 0 ? "in stock" : "out of stock";
  const baseId = p.id;
  // Each size/price is its own catalog product (no item_group_id grouping).
  const sizes = p.sizes?.length ? p.sizes : [""];

  return sizes.map((size) => {
    const unit = priceForProduct(p, size || undefined);
    const onSale = p.oldPrice != null && p.oldPrice > unit;
    const price = `${(onSale ? p.oldPrice! : unit).toFixed(2)} ${business.currency}`;
    const salePrice = onSale ? `${unit.toFixed(2)} ${business.currency}` : "";
    const id = catalogItemId(baseId, size || undefined);
    const link = size
      ? `${baseLink}?size=${encodeURIComponent(size)}`
      : baseLink;

    return {
      id,
      title: size ? `${p.name} (${size})` : p.name,
      description: desc.replace(/\s+/g, " ").slice(0, 5000),
      availability,
      condition: "new",
      price,
      link,
      image_link: imageLink,
      brand,
      additional_image_link: additional,
      google_product_category: gpc,
      product_type: size || p.subCategory || p.categoryName || p.category,
      sale_price: salePrice,
      item_group_id: "",
      size: size,
      gender,
      quantity_to_sell_on_facebook: String(Math.max(0, p.stock)),
      status: p.live ? "active" : "archived",
    };
  });
}

/** Build Meta Commerce Manager CSV (UTF-8). Always includes newly live products. */
export function buildMetaCatalogCsv(products: Product[]): string {
  const lines = [HEADERS.join(",")];
  for (const p of products) {
    if (!p.live) continue;
    for (const row of productRows(p)) {
      lines.push(HEADERS.map((h) => csvEscape(row[h] ?? "")).join(","));
    }
  }
  return `${lines.join("\n")}\n`;
}
