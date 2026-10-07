"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { getCategoryOffer } from "@/lib/catalog";
import { categories, type Category } from "@/lib/categories";
import { discountPercent, formatKes } from "@/lib/format";

export function AllCategoriesMenu() {
  const { products } = useProducts();
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setActiveSlug(null);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = categories.find((c) => c.slug === activeSlug) ?? null;

  return (
    <div ref={ref} className="relative hidden shrink-0 sm:block">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setActiveSlug(null);
        }}
        className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark"
      >
        All categories
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 flex overflow-hidden rounded-lg border border-ink/10 bg-white shadow-xl">
          <ul className="min-w-[220px] border-r border-ink/8 py-1">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveSlug(cat.slug)}
                  onClick={() => setActiveSlug(cat.slug)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                    activeSlug === cat.slug
                      ? "bg-brand/20 font-semibold text-ink"
                      : "text-ink hover:bg-ink/[0.04]"
                  }`}
                >
                  {cat.name}
                  <span className="text-ink/35">›</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="w-[280px] p-3">
            {active ? (
              <CategoryPanel
                category={active}
                products={products}
                onNavigate={() => setOpen(false)}
              />
            ) : (
              <p className="px-2 py-6 text-center text-sm text-ink/45">
                Hover a department
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryPanel({
  category,
  products,
  onNavigate,
}: {
  category: Category;
  products: import("@/lib/product-types").Product[];
  onNavigate: () => void;
}) {
  const offer = getCategoryOffer(products, category.slug);
  const discount = offer ? discountPercent(offer.price, offer.oldPrice) : null;
  const hasSubs = Boolean(category.children?.length);

  return (
    <div>
      <Link
        href={`/category/${category.slug}`}
        onClick={onNavigate}
        className="mb-3 block font-display text-sm font-bold text-ink hover:underline"
      >
        Shop all {category.name}
      </Link>

      {hasSubs ? (
        <div className="mb-3 space-y-2">
          {category.children!.map((child) => (
            <div key={child.slug}>
              <Link
                href={
                  child.slug.includes("mens")
                    ? `/category/${category.slug}?gender=mens`
                    : child.slug.includes("womens")
                      ? `/category/${category.slug}?gender=womens`
                      : `/category/${category.slug}?sub=${child.slug}`
                }
                onClick={onNavigate}
                className="text-sm font-semibold text-ink hover:text-brand-dark"
              >
                {child.name}
              </Link>
              {child.children && (
                <ul className="mt-1 space-y-0.5 pl-2">
                  {child.children.map((leaf) => (
                    <li key={leaf.slug}>
                      <Link
                        href={`/category/${category.slug}?gender=${
                          child.slug.includes("mens") ? "mens" : "womens"
                        }`}
                        onClick={onNavigate}
                        className="text-xs text-ink/60 hover:text-ink"
                      >
                        {leaf.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {offer && (
        <Link
          href={`/product/${offer.slug}`}
          onClick={onNavigate}
          className="mt-2 flex gap-2 rounded-lg bg-ink/[0.03] p-2 hover:bg-brand/15"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-white">
            <Image src={offer.images[0]} alt="" fill className="object-cover" sizes="56px" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
              {hasSubs ? "Featured" : "On offer"}
            </p>
            <p className="line-clamp-2 text-xs font-medium text-ink">{offer.name}</p>
            <p className="font-display text-sm font-bold text-ink">
              {formatKes(offer.price)}
              {discount != null ? (
                <span className="ml-1 text-[10px] font-bold text-stock">-{discount}%</span>
              ) : null}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      className={`transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
