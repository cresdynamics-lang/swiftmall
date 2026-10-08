import type { MetadataRoute } from "next";
import { business } from "@/lib/business";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/checkout/",
          "/account",
          "/saved",
          "/search",
          "/management",
          "/management/",
        ],
      },
    ],
    sitemap: `${business.url}/sitemap.xml`,
  };
}
