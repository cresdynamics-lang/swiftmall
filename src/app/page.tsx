import { CategoryRow } from "@/components/home/CategoryRow";
import { FlashDeals } from "@/components/home/FlashDeals";
import { MarketHeroRow } from "@/components/home/MarketHeroRow";
import type { CampaignSlide } from "@/components/home/CampaignHero";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatsNewRow } from "@/components/home/WhatsNewRow";
import { listStoreCategories } from "@/lib/categories-db";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { listLiveProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";

export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([
    listLiveProducts(),
    listStoreCategories(),
    getStoreSettings(),
  ]);
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  const shopCategories = categories.filter((c) => c.slug !== "others");

  const slides: CampaignSlide[] = HERO_SLIDES.map((def) => {
    const slideProducts = def.productSlugs
      .map((slug) => bySlug[slug])
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        slug: p!.slug,
        name: p!.name,
        price: p!.price,
        oldPrice: p!.oldPrice,
        image: p!.images[0] ?? "/products/p01.jpg",
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

  return (
    <>
      <MarketHeroRow slides={slides} />
      <FlashDeals flashEndsAt={flashEndsAt} />
      <WhatsNewRow />
      {shopCategories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}
      <RecentlyViewed />
      <TrustStrip />
    </>
  );
}
