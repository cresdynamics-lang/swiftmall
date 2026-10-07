import { CategoryRow } from "@/components/home/CategoryRow";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";
import { FlashDeals } from "@/components/home/FlashDeals";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PromiseStrip } from "@/components/home/PromiseStrip";
import { RecentlyViewed } from "@/components/home/RecentlyViewed";
import { TrustStrip } from "@/components/home/TrustStrip";
import { categories } from "@/lib/categories";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <PromiseStrip />
      <DepartmentTiles />
      <FlashDeals />
      {categories.map((cat) => (
        <CategoryRow key={cat.slug} category={cat} />
      ))}
      <RecentlyViewed />
      <TrustStrip />
    </>
  );
}
