import type { MetadataRoute } from "next";
import { business, isTrustPageLive } from "@/lib/business";
import { listStoreCategories } from "@/lib/categories-db";
import { listLiveProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = business.url;
  const [products, categories] = await Promise.all([
    listLiveProducts(),
    listStoreCategories(),
  ]);

  const staticPaths: { path: string; live: boolean }[] = [
    { path: "", live: true },
    { path: "/categories", live: true },
    { path: "/deals", live: true },
    { path: "/how-to-order", live: isTrustPageLive("howToOrder") },
    { path: "/delivery", live: isTrustPageLive("delivery") },
    { path: "/payments", live: isTrustPageLive("payments") },
    { path: "/faq", live: isTrustPageLive("faq") },
    { path: "/contact", live: isTrustPageLive("contact") },
    { path: "/about", live: isTrustPageLive("about") },
    { path: "/returns", live: isTrustPageLive("returns") },
    { path: "/warranty", live: isTrustPageLive("warranty") },
    { path: "/help/terms", live: true },
    { path: "/help/privacy", live: true },
    { path: "/track", live: true },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths
    .filter((p) => p.live)
    .map((p) => ({
      url: `${base}${p.path || "/"}`,
      lastModified: new Date(),
      changeFrequency: p.path === "" ? "daily" : "weekly",
      priority: p.path === "" ? 1 : 0.7,
    }));

  for (const cat of categories.filter((c) => c.slug !== "others")) {
    entries.push({
      url: `${base}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const product of products) {
    entries.push({
      url: `${base}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
