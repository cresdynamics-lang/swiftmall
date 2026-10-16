import { META_CATALOG_FEED_PATH } from "@/lib/meta-catalog";
import { NextResponse } from "next/server";

/** Alias → canonical Meta catalog CSV feed. */
export async function GET(req: Request) {
  return NextResponse.redirect(new URL(META_CATALOG_FEED_PATH, req.url), 308);
}
