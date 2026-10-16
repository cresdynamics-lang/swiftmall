import { NextResponse } from "next/server";
import { buildMetaCatalogCsv } from "@/lib/meta-catalog";
import { listLiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Meta Commerce Manager product catalog CSV.
 * Schedule this URL in Commerce Manager → Catalog → Data sources → Scheduled feed.
 * New / updated live products appear automatically on the next pull.
 */
export async function GET() {
  const products = await listLiveProducts();
  const csv = buildMetaCatalogCsv(products);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="swiftmall-meta-catalog.csv"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Product-Count": String(products.length),
    },
  });
}
