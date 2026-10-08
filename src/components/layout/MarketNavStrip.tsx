"use client";

import Link from "next/link";

export function MarketNavStrip() {
  return (
    <div className="border-b border-ink/8 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 [scrollbar-width:thin] sm:px-4 lg:py-1.5">
        <Link
          href="/deals?tab=new"
          className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink/[0.06] px-3 text-xs font-semibold text-ink lg:rounded-md lg:px-3 lg:py-2 lg:text-sm"
        >
          What&apos;s New
        </Link>
        <Link
          href="/deals"
          className="inline-flex h-10 shrink-0 items-center rounded-full bg-brand px-3 text-xs font-semibold text-ink hover:bg-brand-dark lg:rounded-md lg:px-3 lg:py-2 lg:text-sm"
        >
          <span aria-hidden>⚡</span> Flash Sale
        </Link>
      </div>
    </div>
  );
}
