import type { Metadata } from "next";
import { CategoryRow } from "@/components/home/CategoryRow";
import { FlashDeals } from "@/components/home/FlashDeals";
import { MarketHeroRow } from "@/components/home/MarketHeroRow";
import type { CampaignSlide } from "@/components/home/CampaignHero";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { HomeTrustStrip } from "@/components/home/HomeTrustStrip";
import { HowItWorksBlock } from "@/components/home/HowItWorksBlock";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { WhatsNewRow } from "@/components/home/WhatsNewRow";
import { business } from "@/lib/business";
import { listStoreCategories } from "@/lib/categories-db";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { listLiveProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: {
    absolute: "Swift Mall | Online Shop Kenya: Beauty, Electronics, Phones, Home",
  },
  description:
    "Shop health & beauty, kitchen appliances, electronics, phones, gifts and fashion online in Kenya. Pay on delivery. Countrywide delivery at a flat KES 250.",
  openGraph: {
    title: "Swift Mall | Online Shop Kenya",
    description:
      "Pay on delivery. Countrywide delivery at a flat KES 250. Beauty, home, electronics, phones, gifts and fashion.",
    url: business.url,
    siteName: business.brandName,
    images: [{ url: business.logo.full }],
  },
};

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([
    listLiveProducts(),
    listStoreCategories(),
    getStoreSettings(),
  ]);
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  const shopCategories = categories.filter((c) => c.slug !== "others");

  const slides: CampaignSlide[] = HERO_SLIDES.map((def) => {
    const picked = new Set<string>();
    const fromSlugs = def.productSlugs
      .map((slug) => bySlug[slug])
      .filter(Boolean) as typeof products;
    for (const p of fromSlugs) picked.add(p.slug);

    // Pad with live products from the same department so new catalogue items show up
    const fillers = products.filter(
      (p) => p.category === def.departmentSlug && !picked.has(p.slug),
    );
    const combined = [...fromSlugs, ...fillers].slice(0, 3);

    const slideProducts = combined.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.images[0] || "/brand/favicon-32.png",
    }));

    if (slideProducts.length < 2) {
      console.warn(`[hero] Slide ${def.id} has fewer than 2 products`, def.productSlugs);
    }
    if (def.backgroundShape !== "none" && !def.background) {
      console.warn(`[hero] Slide ${def.id} is missing a background photo`);
    }

    return { ...def, products: slideProducts };
  });

  const flashEndsAt = settings.flashEndsAt
    ? new Date(settings.flashEndsAt).toISOString()
    : null;

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: business.brandName,
    url: business.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${business.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.brandName,
    url: business.url,
    logo: `${business.url}${business.logo.full}`,
    email: business.email,
    telephone: `+254${business.phone.replace(/^0/, "")}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <MarketHeroRow slides={slides} flashEndsAt={flashEndsAt} />
      <HomeTrustStrip />
      <FlashDeals flashEndsAt={flashEndsAt} />
      <WhatsNewRow />
      {shopCategories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}
      <RecentlyViewed />
      <HowItWorksBlock />
      <AboutTeaser />
    </>
  );
}
