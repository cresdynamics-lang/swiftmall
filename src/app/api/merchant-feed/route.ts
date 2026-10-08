import { NextResponse } from "next/server";
import { business } from "@/lib/business";
import { listLiveProducts } from "@/lib/products";

/**
 * Google Merchant Center style TSV feed.
 * Excludes products missing photo, price or a usable description (≥20 chars).
 */
export async function GET() {
  const products = await listLiveProducts();
  const excluded: { slug: string; reason: string }[] = [];
  const rows: string[] = [];

  const header = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "price",
    "availability",
    "brand",
    "condition",
    "product_type",
    "shipping",
  ].join("\t");
  rows.push(header);

  for (const p of products) {
    const image = p.images[0];
    const desc = (p.description ?? "").trim();
    if (!image) {
      excluded.push({ slug: p.slug, reason: "missing photo" });
      continue;
    }
    if (!p.price || p.price <= 0) {
      excluded.push({ slug: p.slug, reason: "missing price" });
      continue;
    }
    if (desc.length < 20) {
      excluded.push({ slug: p.slug, reason: "description too short" });
      continue;
    }

    const availability = p.stock > 0 ? "in_stock" : "out_of_stock";
    const shipping = `KE:::${business.shippingFlatKes}.00 KES`;
    rows.push(
      [
        p.sku || p.id,
        p.name.replace(/\t/g, " "),
        desc.replace(/\t/g, " ").replace(/\n/g, " "),
        `${business.url}/product/${p.slug}`,
        image.startsWith("http") ? image : `${business.url}${image}`,
        `${p.price}.00 KES`,
        availability,
        (p.brand || "").replace(/\t/g, " "),
        "new",
        p.category,
        shipping,
      ].join("\t"),
    );
  }

  const body = `${rows.join("\n")}\n# excluded ${excluded.length}: ${excluded
    .map((e) => `${e.slug}(${e.reason})`)
    .join(", ")}\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "X-Excluded-Count": String(excluded.length),
    },
  });
}
