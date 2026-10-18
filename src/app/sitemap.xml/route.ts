import { NextResponse } from "next/server";
import { business, isTrustPageLive } from "@/lib/business";
import { listStoreCategories } from "@/lib/categories-db";
import { listLiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type Entry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

function urlBlock(e: Entry): string {
  const lastmod = e.lastmod
    ? `\n  <lastmod>${escapeXml(e.lastmod)}</lastmod>`
    : "";
  const changefreq = e.changefreq
    ? `\n  <changefreq>${e.changefreq}</changefreq>`
    : "";
  const priority =
    e.priority != null ? `\n  <priority>${e.priority.toFixed(1)}</priority>` : "";
  return `<url>\n  <loc>${escapeXml(e.loc)}</loc>${lastmod}${changefreq}${priority}\n</url>`;
}

/**
 * Live sitemap for Google Search Console / crawlers.
 * Rebuilt from the database on every request (new products appear automatically).
 */
export async function GET() {
  const base = business.url;
  const now = new Date().toISOString();
  const [products, categories] = await Promise.all([
    listLiveProducts(),
    listStoreCategories(),
  ]);

  const staticPaths: { path: string; live: boolean; priority: number; freq: Entry["changefreq"] }[] =
    [
      { path: "/", live: true, priority: 1, freq: "daily" },
      { path: "/categories", live: true, priority: 0.7, freq: "weekly" },
      { path: "/deals", live: true, priority: 0.7, freq: "daily" },
      { path: "/how-to-order", live: isTrustPageLive("howToOrder"), priority: 0.6, freq: "monthly" },
      { path: "/delivery", live: isTrustPageLive("delivery"), priority: 0.6, freq: "monthly" },
      { path: "/payments", live: isTrustPageLive("payments"), priority: 0.6, freq: "monthly" },
      { path: "/faq", live: isTrustPageLive("faq"), priority: 0.6, freq: "monthly" },
      { path: "/contact", live: isTrustPageLive("contact"), priority: 0.6, freq: "monthly" },
      { path: "/about", live: isTrustPageLive("about"), priority: 0.5, freq: "monthly" },
      { path: "/returns", live: isTrustPageLive("returns"), priority: 0.6, freq: "monthly" },
      { path: "/warranty", live: isTrustPageLive("warranty"), priority: 0.5, freq: "monthly" },
      { path: "/help/terms", live: true, priority: 0.3, freq: "yearly" },
      { path: "/help/privacy", live: true, priority: 0.3, freq: "yearly" },
    ];

  const entries: Entry[] = staticPaths
    .filter((p) => p.live)
    .map((p) => ({
      loc: `${base}${p.path === "/" ? "/" : p.path}`,
      lastmod: now,
      changefreq: p.freq,
      priority: p.priority,
    }));

  for (const cat of categories.filter((c) => c.slug !== "others")) {
    entries.push({
      loc: `${base}/category/${encodeURI(cat.slug)}`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.8,
    });
  }

  for (const product of products) {
    if (!product.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(product.slug)) continue;
    entries.push({
      loc: `${base}/product/${product.slug}`,
      lastmod: product.createdAt || now,
      changefreq: "weekly",
      priority: 0.6,
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlBlock).join("\n")}
</urlset>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Sitemap-Url-Count": String(entries.length),
    },
  });
}
