"use client";

import { useEffect, useMemo, useState } from "react";
import { CategorySidebar } from "@/components/home/CategorySidebar";
import {
  CampaignHero,
  HeroOfferCards,
  type CampaignSlide,
} from "@/components/home/CampaignHero";
import { DepartmentTiles } from "@/components/home/DepartmentTiles";

/** Viewport minus top strip + navbar + market nav (~8.5rem) */
const DESKTOP_HERO_H = "lg:h-[calc(100dvh-8.5rem)]";

export function MarketHeroRow({ slides }: { slides: CampaignSlide[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const offers = useMemo(() => {
    const slide = slides[activeIndex] ?? slides[0];
    return slide?.products.slice(0, 2) ?? [];
  }, [slides, activeIndex]);

  useEffect(() => {
    const handler = () => setDrawerOpen(true);
    window.addEventListener("swiftmall:open-categories", handler);
    return () => window.removeEventListener("swiftmall:open-categories", handler);
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl px-3 pt-3 sm:px-4">
        <div
          className={`lg:grid lg:grid-cols-[240px_minmax(0,1fr)_280px] lg:items-stretch lg:gap-3 ${DESKTOP_HERO_H}`}
        >
          <div className="hidden h-full min-h-0 lg:block">
            <CategorySidebar className="h-full" />
          </div>

          <div className="min-h-0 min-w-0 lg:h-full">
            <CampaignHero slides={slides} onIndexChange={setActiveIndex} />
          </div>

          <div className="mt-3 hidden min-h-0 lg:mt-0 lg:block lg:h-full">
            <HeroOfferCards products={offers} />
          </div>
        </div>

        {/* Tablet offers */}
        <div className="mt-3 hidden gap-3 md:grid md:grid-cols-2 lg:hidden">
          {offers.map((p) => (
            <div key={p.id} className="h-[132px]">
              <HeroOfferCards products={[p]} />
            </div>
          ))}
        </div>

        {/* Phone offers */}
        <div className="mt-3 md:hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">
            Offers
          </p>
          <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:thin] snap-x">
            {offers.map((p) => (
              <div key={p.id} className="w-[82%] shrink-0 snap-start">
                <div className="h-[128px]">
                  <HeroOfferCards products={[p]} />
                </div>
              </div>
            ))}
          </div>
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
