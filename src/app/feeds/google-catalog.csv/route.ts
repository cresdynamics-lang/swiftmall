import { NextResponse } from "next/server";
import { buildGoogleCatalogCsv } from "@/lib/google-catalog";
import { listLiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Google catalog as CSV (same live products as the TSV feed). */
export async function GET() {
  const products = await listLiveProducts();
  const body = buildGoogleCatalogCsv(products);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="swiftmall-google-catalog.csv"',
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Product-Count": String(products.length),
    },
  });
}
