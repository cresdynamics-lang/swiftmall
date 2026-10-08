"use client";

import { useEffect, useMemo, useState } from "react";
import { CategorySidebar } from "@/components/home/CategorySidebar";
import {
  CampaignHero,
  type CampaignProduct,
  type CampaignSlide,
} from "@/components/home/CampaignHero";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";
import { HeroFlashPanel } from "@/components/home/HeroFlashPanel";
import { useProducts } from "@/context/ProductsContext";
import { discountPercent } from "@/lib/format";

/** Full viewport under top strip + navbar + large category strip */
const DESKTOP_HERO_H = "lg:h-[calc(100dvh-9.5rem)]";

export function MarketHeroRow({
  slides,
  flashEndsAt = null,
}: {
  slides: CampaignSlide[];
  flashEndsAt?: string | null;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { products } = useProducts();

  /** Stable flash products — never swap when the carousel advances. */
  const flashProducts: CampaignProduct[] = useMemo(() => {
    const marked = products.filter((p) => p.flashDeal && p.live !== false);
    const list =
      marked.length > 0
        ? marked
        : products.filter((p) => p.oldPrice != null && p.oldPrice > p.price);
    const sorted = [...list].sort((a, b) => {
      const da = discountPercent(a.price, a.oldPrice) ?? 0;
      const db = discountPercent(b.price, b.oldPrice) ?? 0;
      return db - da;
    });
    const picked = sorted.slice(0, 2);
    if (picked.length >= 2) {
      return picked.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.images[0] ?? "/products/p01.jpg",
      }));
    }
    // Fallback: first slide catalogue picks (still fixed, not per-slide)
    return slides[0]?.products.slice(0, 2) ?? [];
  }, [products, slides]);

  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener("swiftmall:open-categories", handler);
    return () => window.removeEventListener("swiftmall:open-categories", handler);
  }, []);

  return (
    <>
      <div className={`w-full px-3 pt-3 sm:px-4 lg:px-6 ${DESKTOP_HERO_H}`}>
        <div className="flex h-full min-h-0 w-full flex-col gap-3 md:flex-row md:gap-3 lg:gap-4">
          {/* Carousel — cuts off where the flash panel begins */}
          <div className="min-h-[260px] min-w-0 flex-1 md:min-h-[380px] lg:min-h-0">
            <CampaignHero slides={slides} />
          </div>

          {/* Static yellow flash end — timer + two cards, no slide animation */}
          {flashProducts.length > 0 ? (
            <div className="w-full shrink-0 md:w-[min(42%,400px)] md:min-h-[380px] lg:w-[min(36%,420px)] lg:min-h-0">
              <HeroFlashPanel products={flashProducts} flashEndsAt={flashEndsAt} />
            </div>
          ) : null}
        </div>
      </div>

      <DepartmentTiles />

      {drawerOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50"
            aria-label="Close categories"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-3 py-3">
              <p className="font-display text-base font-bold">Categories</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md px-2 py-1 text-sm font-semibold"
              >
                Close
              </button>
            </div>
            <CategorySidebar
              mobile
              className="min-h-0 flex-1 rounded-none border-0"
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
