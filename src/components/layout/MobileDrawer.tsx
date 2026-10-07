"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCategoryOffer } from "@/lib/catalog";
import { categories } from "@/lib/categories";
import { formatKes } from "@/lib/format";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3 text-white">
          <p className="font-display text-lg font-bold">All categories</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map((cat) => {
            const isOpen = expanded === cat.slug;
            const offer = getCategoryOffer(cat.slug);
            const hasKids = Boolean(cat.children?.length);

            return (
              <div key={cat.slug} className="border-b border-ink/5">
                <div className="flex items-center">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-base text-ink"
                  >
                    {cat.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : cat.slug)}
                    className="px-4 py-3 text-ink/40"
                    aria-label={`Expand ${cat.name}`}
                  >
                    {isOpen ? "⌃" : "⌄"}
                  </button>
                </div>

                {isOpen && (
                  <div className="bg-ink/[0.03] px-4 pb-3">
                    {hasKids ? (
                      <div className="space-y-2 pb-2">
                        {cat.children!.map((child) => (
                          <Link
                            key={child.slug}
                            href={
                              child.slug.includes("mens")
                                ? `/category/${cat.slug}?gender=mens`
                                : child.slug.includes("womens")
                                  ? `/category/${cat.slug}?gender=womens`
                                  : `/category/${cat.slug}?sub=${child.slug}`
                            }
                            onClick={onClose}
                            className="block text-sm font-medium text-ink/80"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                    {offer && (
                      <Link
                        href={`/product/${offer.slug}`}
                        onClick={onClose}
                        className="mt-1 flex gap-2 rounded-lg bg-white p-2 ring-1 ring-ink/8"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                          <Image
                            src={offer.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase text-ink/45">
                            {hasKids ? "Featured" : "On offer"}
                          </p>
                          <p className="line-clamp-1 text-xs font-medium text-ink">{offer.name}</p>
                          <p className="text-xs font-bold">{formatKes(offer.price)}</p>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            href="/deals"
            onClick={onClose}
            className="mx-4 mt-4 block rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-ink"
          >
            Deals
          </Link>
        </nav>
      </aside>
    </div>
  );
}
