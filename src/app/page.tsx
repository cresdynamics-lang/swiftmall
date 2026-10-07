import { CategoryRow } from "@/components/home/CategoryRow";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";
import { FlashDeals } from "@/components/home/FlashDeals";
import { HeroBanner, type HeroSlideView } from "@/components/home/HeroBanner";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustStrip } from "@/components/home/TrustStrip";
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

  const slides: HeroSlideView[] = HERO_SLIDES.map((def) => {
    const offers = def.offerSlugs
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

    if (offers.length < 2) {
      console.warn(`[hero] Slide ${def.id} is missing offer products`, def.offerSlugs);
    }
    if (!def.image) {
      console.warn(`[hero] Slide ${def.id} is missing a photo`);
    }

    return { ...def, offers };
  });

  const flashEndsAt = settings.flashEndsAt
    ? new Date(settings.flashEndsAt).toISOString()
    : null;

  return (
    <>
      <HeroBanner slides={slides} />
      <DepartmentTiles />
      <FlashDeals flashEndsAt={flashEndsAt} />
      {shopCategories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}
      <RecentlyViewed />
      <TrustStrip />
    </>
  );
}
