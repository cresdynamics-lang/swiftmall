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
  flush = false,
}: {
  products: CampaignProduct[];
  flashEndsAt: string | null;
  /** When true, no own radius — sits inside a shared split shell. */
  flush?: boolean;
}) {
  if (!products.length) return null;

  return (
    <aside
      className={`flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-brand p-3 text-ink sm:p-4 ${
        flush ? "" : "rounded-[14px] lg:rounded-2xl"
      }`}
      aria-label="Flash sale offers"
    >
      <FlashCountdown endsAt={flashEndsAt} compact variant="onYellow" />
      <div className="flex min-h-0 flex-1 flex-col">
        <HeroOfferCards products={products.slice(0, 2)} />
      </div>
    </aside>
  );
}
