import { GOOGLE_CATALOG_FEED_PATH } from "@/lib/google-catalog";
import { NextResponse } from "next/server";

/** Legacy alias → Google Merchant Center TSV feed. */
export async function GET(req: Request) {
  return NextResponse.redirect(new URL(GOOGLE_CATALOG_FEED_PATH, req.url), 308);
}
