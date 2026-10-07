import { CategoryRow } from "@/components/home/CategoryRow";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";
import { FlashDeals } from "@/components/home/FlashDeals";
import { HeroBanner, type HeroSlide } from "@/components/home/HeroBanner";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustStrip } from "@/components/home/TrustStrip";
import { listActiveBanners } from "@/lib/banners";
import { listStoreCategories } from "@/lib/categories-db";

export default async function HomePage() {
  const [banners, categories] = await Promise.all([
    listActiveBanners(),
    listStoreCategories(),
  ]);
  const shopCategories = categories.filter((c) => c.slug !== "others");
  const slides: HeroSlide[] = banners.map((b) => {
    const tiles = [b.tile1Product, b.tile2Product]
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        slug: p!.slug,
        name: p!.name,
        price: p!.price,
        oldPrice: p!.oldPrice,
        image: p!.images[0] ?? "/products/p01.jpg",
        offerTag: p!.offerTag,
      }));

    return {
      id: b.id,
      department: b.category?.name ?? "Swiftmall",
      href: b.category ? `/category/${b.category.slug}` : "/deals",
      headline: b.headline,
      sub: b.subheadline,
      copy: b.copy,
      cta: b.ctaLabel,
      tiles,
    };
  });

  return (
    <>
      <HeroBanner slides={slides} />
      <DepartmentTiles />
      <FlashDeals />
      {shopCategories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}
      <RecentlyViewed />
      <TrustStrip />
    </>
  );
}
