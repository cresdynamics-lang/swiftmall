import { business } from "@/lib/business";
import { catalogItemId } from "@/lib/meta-catalog";
import { priceForProduct } from "@/lib/product-price";
import type { Product } from "@/lib/product-types";

/** Google Merchant Center scheduled feed URL (TSV — preferred). */
export const GOOGLE_CATALOG_FEED_PATH = "/feeds/google-catalog.tsv";
export const GOOGLE_CATALOG_FEED_URL = `${business.url}${GOOGLE_CATALOG_FEED_PATH}`;
/** CSV alias (same products; Merchant Center prefers TSV). */
export const GOOGLE_CATALOG_CSV_PATH = "/feeds/google-catalog.csv";

const GOOGLE_PRODUCT_CATEGORY: Record<string, string> = {
  "health-and-beauty": "Health & Beauty",
  "kitchen-and-home": "Home & Garden > Kitchen & Dining",
  electronics: "Electronics",
  "phones-and-accessories":
    "Electronics > Communications > Telephony > Mobile Phones",
  "gifts-and-accessories":
    "Arts & Entertainment > Party & Celebration > Gift Giving",
  fashion: "Apparel & Accessories",
  others: "Home & Garden",
};

function absoluteImage(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${business.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function genderForGoogle(gender?: Product["gender"]): string {
  if (gender === "mens") return "male";
  if (gender === "womens") return "female";
  if (gender === "unisex") return "unisex";
  return "";
}

function cleanCell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const HEADERS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "additional_image_link",
  "availability",
  "price",
  "sale_price",
  "brand",
  "condition",
  "google_product_category",
  "product_type",
  "item_group_id",
  "size",
  "gender",
  "mpn",
  "identifier_exists",
  "shipping",
] as const;

type CatalogRow = Record<(typeof HEADERS)[number], string>;

function productRows(p: Product): CatalogRow[] {
  const image = p.images[0];
  const desc = (p.description ?? "").trim() || p.name;
  if (!image || !p.price || p.price <= 0) return [];

  const brand = cleanCell(p.brand || business.brandName);
  const baseLink = `${business.url}/product/${p.slug}`;
  // Display image + angles stay on one feed row (not separate products).
  const imageLink = absoluteImage(image);
  const additional = p.images.slice(1, 10).map(absoluteImage).join(",");
  const gpc = GOOGLE_PRODUCT_CATEGORY[p.category] ?? "Home & Garden";
  const gender = genderForGoogle(p.gender);
  const availability = p.stock > 0 ? "in_stock" : "out_of_stock";
  const shipping = `KE:::${business.shippingFlatKes.toFixed(2)} ${business.currency}`;
  // Each size/price is its own catalog product (no item_group_id grouping).
  const sizes = p.sizes?.length ? p.sizes : [""];
  const baseId = p.id;

  return sizes.map((size) => {
    const unit = priceForProduct(p, size || undefined);
    const onSale = p.oldPrice != null && p.oldPrice > unit;
    const price = `${(onSale ? p.oldPrice! : unit).toFixed(2)} ${business.currency}`;
    const salePrice = onSale ? `${unit.toFixed(2)} ${business.currency}` : "";
    const id = catalogItemId(baseId, size || undefined);
    const title = cleanCell(size ? `${p.name} (${size})` : p.name).slice(0, 150);
    const link = size
      ? `${baseLink}?size=${encodeURIComponent(size)}`
      : baseLink;

    return {
      id,
      title,
      description: cleanCell(desc).slice(0, 5000),
      link,
      image_link: imageLink,
      additional_image_link: additional,
      availability,
      price,
      sale_price: salePrice,
      brand,
      condition: "new",
      google_product_category: gpc,
      product_type: cleanCell(size || p.subCategory || p.categoryName || p.category),
      item_group_id: "",
      size: size ? cleanCell(size) : "",
      gender,
      mpn: id.slice(0, 70),
      identifier_exists: "no",
      shipping,
    };
  });
}

function rowsFromProducts(products: Product[]): CatalogRow[] {
  const rows: CatalogRow[] = [];
  for (const p of products) {
    if (!p.live) continue;
    rows.push(...productRows(p));
  }
  return rows;
}

/** Google Merchant Center TSV (tab-separated). */
export function buildGoogleCatalogTsv(products: Product[]): string {
  const rows = rowsFromProducts(products);
  const lines = [HEADERS.join("\t")];
  for (const row of rows) {
    lines.push(HEADERS.map((h) => cleanCell(row[h] ?? "")).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}

/** Same catalog as CSV (optional; Google prefers TSV). */
export function buildGoogleCatalogCsv(products: Product[]): string {
  const rows = rowsFromProducts(products);
  const lines = [HEADERS.join(",")];
  for (const row of rows) {
    lines.push(HEADERS.map((h) => csvEscape(row[h] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}
