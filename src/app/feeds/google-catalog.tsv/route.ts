import { NextResponse } from "next/server";
import { buildGoogleCatalogTsv } from "@/lib/google-catalog";
import { listLiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Google Merchant Center product feed (TSV).
 * Schedule: Merchant Center → Products → Add products → Scheduled fetch.
 * New / updated live products appear automatically on the next pull.
 */
export async function GET() {
  const products = await listLiveProducts();
  const body = buildGoogleCatalogTsv(products);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/tab-separated-values; charset=utf-8",
      "Content-Disposition": 'inline; filename="swiftmall-google-catalog.tsv"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Product-Count": String(products.length),
    },
  });
}
