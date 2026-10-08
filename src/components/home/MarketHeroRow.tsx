"use client";

import { useEffect, useMemo, useState } from "react";
import { CategorySidebar } from "@/components/home/CategorySidebar";
import {
  CampaignHero,
  CircleProduct,
  type CampaignSlide,
} from "@/components/home/CampaignHero";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";

/** Full viewport under top strip + navbar + large category strip */
const DESKTOP_HERO_H = "lg:h-[calc(100dvh-9.5rem)]";

export function MarketHeroRow({ slides }: { slides: CampaignSlide[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const offers = useMemo(() => {
    const slide = slides[activeIndex] ?? slides[0];
    return slide?.products.slice(0, 3) ?? [];
  }, [slides, activeIndex]);

  const theme = slides[activeIndex]?.theme ?? "sun";

  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener("swiftmall:open-categories", handler);
    return () => window.removeEventListener("swiftmall:open-categories", handler);
  }, []);

  return (
    <>
      <div className={`w-full px-3 pt-3 sm:px-4 lg:px-6 ${DESKTOP_HERO_H}`}>
        <div className="h-full min-h-0 w-full">
          <CampaignHero slides={slides} onIndexChange={setActiveIndex} />
        </div>
      </div>

      {/* Phone: same circular tagged products under the hero */}
      <div className="mt-4 md:hidden">
        <div className="flex justify-center gap-4 overflow-x-auto px-3 pb-2 [scrollbar-width:thin]">
          {offers.map((p, i) => (
            <CircleProduct
              key={p.id}
              product={p}
              theme={theme}
              size={i === 1 ? "md" : "sm"}
              rotate={i === 0 ? -4 : i === 2 ? 4 : 0}
            />
          ))}
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
