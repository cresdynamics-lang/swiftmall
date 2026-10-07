"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { getCategoryOffer } from "@/lib/catalog";
import type { Category } from "@/lib/categories";
import { discountPercent, formatKes } from "@/lib/format";

export function CategoryNav() {
  const categories = useCategories();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <div className="relative z-40 hidden border-b border-ink/8 bg-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center gap-0.5 overflow-visible px-4 py-1.5">
        <Link
          href="/categories"
          className="shrink-0 rounded px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-ink/70 hover:bg-ink/[0.04] hover:text-ink"
        >
          All categories
        </Link>
        {categories
          .filter((cat) => cat.slug !== "others")
          .map((cat) => (
          <CategoryHoverItem
            key={cat.slug}
            category={cat}
            open={openSlug === cat.slug}
            onOpen={() => setOpenSlug(cat.slug)}
            onClose={() => setOpenSlug(null)}
          />
        ))}
        <Link
          href="/deals"
          className="ml-auto shrink-0 rounded bg-brand px-3 py-1.5 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Deals
        </Link>
      </div>
    </div>
  );
}

function CategoryHoverItem({
  category,
  open,
  onOpen,
  onClose,
}: {
  category: Category;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const { products } = useProducts();
  const hasSubs = Boolean(category.children?.length);
  const offer = getCategoryOffer(products, category.slug);
  const discount = offer ? discountPercent(offer.price, offer.oldPrice) : null;

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose();
      }}
    >
      <Link
        href={`/category/${category.slug}`}
        className={`block shrink-0 rounded px-2.5 py-2 text-sm transition ${
          open ? "bg-ink/[0.06] font-semibold text-ink" : "text-ink/80 hover:bg-ink/[0.04] hover:text-ink"
        }`}
      >
        {category.name}
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[320px] overflow-hidden rounded-b-xl border border-t-0 border-ink/10 bg-white shadow-xl">
          {hasSubs ? (
            <div className="grid min-w-[480px] grid-cols-[1fr_200px] gap-0">
              <div className="p-4">
                {category.children!.map((child) => (
                  <div key={child.slug} className="mb-3 last:mb-0">
                    <Link
                      href={
                        child.slug.includes("mens")
                          ? `/category/${category.slug}?gender=mens`
                          : child.slug.includes("womens")
                            ? `/category/${category.slug}?gender=womens`
                            : `/category/${category.slug}?sub=${child.slug}`
                      }
                      className="text-sm font-semibold text-ink hover:text-brand-dark"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                    {child.children && (
                      <ul className="mt-1 space-y-1">
                        {child.children.map((leaf) => (
                          <li key={leaf.slug}>
                            <Link
                              href={`/category/${category.slug}?gender=${
                                child.slug.includes("mens") ? "mens" : "womens"
                              }`}
                              className="text-xs text-ink/65 hover:text-ink"
                              onClick={onClose}
                            >
                              {leaf.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <Link
                  href={`/category/${category.slug}`}
                  onClick={onClose}
                  className="mt-2 inline-block text-xs font-semibold text-ink underline"
                >
                  Shop all {category.name}
                </Link>
              </div>
              {offer && (
                <OfferTile offer={offer} discount={discount} onClose={onClose} />
              )}
            </div>
          ) : offer ? (
            <div className="p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                On offer in {category.name}
              </p>
              <OfferCard offer={offer} discount={discount} onClose={onClose} />
            </div>
          ) : (
            <div className="p-4 text-sm text-ink/55">
              <Link href={`/category/${category.slug}`} onClick={onClose} className="font-semibold text-ink">
                Shop {category.name} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OfferTile({
  offer,
  discount,
  onClose,
}: {
  offer: NonNullable<ReturnType<typeof getCategoryOffer>>;
  discount: number | null;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/product/${offer.slug}`}
      onClick={onClose}
      className="relative block border-l border-ink/8 bg-ink/[0.02] p-3 hover:bg-brand/10"
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink/45">Featured</p>
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-white">
        <Image src={offer.images[0]} alt="" fill className="object-cover" sizes="160px" />
        {discount != null && (
          <span className="absolute left-1.5 top-1.5 rounded bg-ink px-1 py-0.5 text-[10px] font-bold text-brand">
            -{discount}%
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-xs font-medium text-ink">{offer.name}</p>
      <p className="mt-1 font-display text-sm font-bold text-ink">{formatKes(offer.price)}</p>
    </Link>
  );
}

function OfferCard({
  offer,
  discount,
  onClose,
}: {
  offer: NonNullable<ReturnType<typeof getCategoryOffer>>;
  discount: number | null;
  onClose: () => void;
}) {
  return (
    <Link
      href={`/product/${offer.slug}`}
      onClick={onClose}
      className="flex gap-3 rounded-lg p-2 hover:bg-ink/[0.03]"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/[0.04]">
        <Image src={offer.images[0]} alt="" fill className="object-cover" sizes="80px" />
        {discount != null && (
          <span className="absolute left-1 top-1 rounded bg-ink px-1 text-[10px] font-bold text-brand">
            -{discount}%
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-medium text-ink">{offer.name}</p>
        <p className="mt-1 font-display text-base font-bold text-ink">
          {formatKes(offer.price)}
          {offer.oldPrice ? (
            <span className="ml-2 text-xs font-normal text-ink/40 line-through">
              {formatKes(offer.oldPrice)}
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-xs font-semibold text-stock">View deal →</p>
      </div>
    </Link>
  );
}
