"use client";

import { HeroOfferCards, type CampaignProduct } from "@/components/home/CampaignHero";
import { FlashCountdown } from "@/components/home/FlashCountdown";

/**
 * Static yellow flash column beside the carousel.
 * Does not animate with slides — only the countdown ticks.
 */
export function HeroFlashPanel({
  products,
  flashEndsAt,
}: {
  products: CampaignProduct[];
  flashEndsAt: string | null;
}) {
  if (!products.length) return null;

  return (
    <aside
      className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-[14px] bg-brand p-3 text-ink sm:p-4 lg:rounded-2xl lg:p-4"
      aria-label="Flash sale offers"
    >
      <FlashCountdown endsAt={flashEndsAt} compact variant="onYellow" />
      <div className="min-h-0 flex-1">
        <HeroOfferCards products={products.slice(0, 2)} />
      </div>
    </aside>
  );
}
