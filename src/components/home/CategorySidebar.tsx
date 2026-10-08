"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { formatKes, discountPercent } from "@/lib/format";
import type { Category } from "@/lib/categories";

const ORDER = [
  "health-and-beauty",
  "kitchen-and-home",
  "electronics",
  "phones-and-accessories",
  "gifts-and-accessories",
  "fashion",
  "others",
];

export function CategorySidebar({
  className = "",
  mobile = false,
  onNavigate,
}: {
  className?: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const all = useCategories();
  const { products, byCategory } = useProducts();
  const [active, setActive] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  const departments = useMemo(() => {
    const withStock = all.filter(
      (c) => products.some((p) => p.category === c.slug),
    );
    return [...withStock].sort(
      (a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug),
    );
  }, [all, products]);

  const activeCat = departments.find((c) => c.slug === active) ?? null;

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function scheduleOpen(slug: string) {
    if (mobile) return;
    clearTimers();
    openTimer.current = setTimeout(() => {
      setActive(slug);
      setPanelOpen(true);
    }, 120);
  }

  function scheduleClose() {
    if (mobile) return;
    clearTimers();
    closeTimer.current = setTimeout(() => {
      setPanelOpen(false);
      setActive(null);
    }, 200);
  }

  useEffect(() => () => clearTimers(), []);

  function onKeyRow(e: React.KeyboardEvent, idx: number, cat: Category) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = departments[(idx + 1) % departments.length];
      setActive(next.slug);
      setPanelOpen(!mobile);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = departments[(idx - 1 + departments.length) % departments.length];
      setActive(prev.slug);
      setPanelOpen(!mobile);
    } else if (e.key === "ArrowRight" && !mobile) {
      e.preventDefault();
      setActive(cat.slug);
      setPanelOpen(true);
    } else if (e.key === "Escape" || e.key === "ArrowLeft") {
      setPanelOpen(false);
    }
  }

  return (
    <nav
      ref={rootRef}
      aria-label="Shop by category"
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-ink/10 bg-white ${className}`}
      onMouseLeave={scheduleClose}
    >
      <ul className="min-h-0 flex-1 overflow-y-auto py-1">
        {departments.map((cat, idx) => {
          const open = active === cat.slug && (mobile ? true : panelOpen);
          return (
            <li key={cat.slug}>
              <div
                className={`flex items-stretch ${
                  open ? "bg-[#FFF6D6]" : "hover:bg-[#FFF6D6]"
                }`}
              >
                <Link
                  href={`/category/${cat.slug}`}
                  onClick={onNavigate}
                  onMouseEnter={() => scheduleOpen(cat.slug)}
                  onFocus={() => scheduleOpen(cat.slug)}
                  onKeyDown={(e) => onKeyRow(e, idx, cat)}
                  className={`relative flex min-h-11 flex-1 items-center gap-2 px-3 text-left text-sm text-ink ${
                    open ? "font-semibold before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand" : ""
                  }`}
                >
                  <span className="flex-1 truncate">{cat.name}</span>
                  <span className="text-ink/35">›</span>
                </Link>
                {mobile ? (
                  <button
                    type="button"
                    aria-expanded={active === cat.slug}
                    aria-label={`Expand ${cat.name}`}
                    className="px-3 text-ink/50"
                    onClick={() =>
                      setActive((a) => (a === cat.slug ? null : cat.slug))
                    }
                  >
                    {active === cat.slug ? "▴" : "▾"}
                  </button>
                ) : null}
              </div>
              {mobile && active === cat.slug ? (
                <MobileSubs
                  category={cat}
                  products={byCategory(cat.slug).slice(0, 6)}
                  onNavigate={onNavigate}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      <Link
        href="/categories"
        onClick={onNavigate}
        className="border-t border-ink/8 px-3 py-3 text-sm font-semibold text-ink hover:underline"
      >
        All categories →
      </Link>

      {!mobile && panelOpen && activeCat ? (
        <Flyout
          category={activeCat}
          products={byCategory(activeCat.slug)}
          onMouseEnter={() => {
            clearTimers();
            setPanelOpen(true);
          }}
          onMouseLeave={scheduleClose}
          onNavigate={onNavigate}
        />
      ) : null}
    </nav>
  );
}

function MobileSubs({
  category,
  products,
  onNavigate,
}: {
  category: Category;
  products: ReturnType<ReturnType<typeof useProducts>["byCategory"]>;
  onNavigate?: () => void;
}) {
  const subs =
    category.slug === "fashion"
      ? [
          { name: "Men's", href: "/category/fashion?g=mens" },
          { name: "Women's", href: "/category/fashion?g=womens" },
        ]
      : (category.children ?? []).map((c) => ({
          name: c.name,
          href: `/category/${category.slug}`,
        }));

  return (
    <div className="bg-ink/[0.03] px-3 py-2">
      {subs.length ? (
        <ul className="space-y-1">
          {subs.map((s) => (
            <li key={s.name}>
              <Link
                href={s.href}
                onClick={onNavigate}
                className="block py-1.5 text-sm text-ink/75 hover:text-ink"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {products.slice(0, 4).map((p) => (
            <li key={p.id}>
              <Link
                href={`/product/${p.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-2 text-sm"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                  <Image src={p.images[0]} alt="" fill className="object-contain p-0.5" sizes="40px" />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-1 font-medium">{p.name}</span>
                  <span className="block text-xs text-ink/55">{formatKes(p.price)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Flyout({
  category,
  products,
  onMouseEnter,
  onMouseLeave,
  onNavigate,
}: {
  category: Category;
  products: ReturnType<ReturnType<typeof useProducts>["byCategory"]>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavigate?: () => void;
}) {
  const featured = products.slice(0, 2);
  const fashionSubs =
    category.slug === "fashion"
      ? [
          { name: "Men's", href: "/category/fashion?g=mens" },
          { name: "Women's", href: "/category/fashion?g=womens" },
        ]
      : null;
  const subs =
    fashionSubs ??
    (category.children ?? []).map((c) => ({
      name: c.name,
      href: `/category/${category.slug}`,
    }));

  return (
    <div
      role="region"
      aria-label={`${category.name} subcategories`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-full top-0 z-50 ml-1 flex h-full min-w-[420px] max-w-[560px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl"
    >
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-display text-base font-bold text-ink">{category.name}</h3>
        {subs.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {subs.map((s) => (
              <li key={s.name}>
                <Link
                  href={s.href}
                  onClick={onNavigate}
                  className="block py-1 text-sm text-ink/75 hover:text-ink hover:underline"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-3 space-y-2">
            {products.slice(0, 6).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/product/${p.slug}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-ink/[0.04]">
                    <Image src={p.images[0]} alt="" fill className="object-contain p-0.5" sizes="40px" />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-1 font-medium">{p.name}</span>
                    <span className="block text-xs text-ink/55">{formatKes(p.price)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/category/${category.slug}`}
          onClick={onNavigate}
          className="mt-4 inline-block text-sm font-semibold text-ink hover:underline"
        >
          Shop all →
        </Link>
      </div>
      <div className="w-[40%] space-y-3 border-l border-ink/8 bg-ink/[0.02] p-3">
        {featured.map((p) => {
          const pct = discountPercent(p.price, p.oldPrice);
          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              onClick={onNavigate}
              className="block rounded-lg bg-white p-2 ring-1 ring-ink/8 hover:shadow-sm"
            >
              <div className="relative mx-auto aspect-square w-full max-w-[120px]">
                <Image src={p.images[0]} alt="" fill className="object-contain p-1" sizes="120px" />
              </div>
              {pct != null ? (
                <span className="mt-1 inline-block rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold">
                  -{pct}%
                </span>
              ) : null}
              <p className="mt-1 line-clamp-2 text-xs font-semibold">{p.name}</p>
              <p className="mt-0.5 text-sm font-bold">
                {formatKes(p.price)}
                {p.oldPrice && pct != null ? (
                  <span className="ml-1 text-[10px] font-normal text-ink/40 line-through">
                    {formatKes(p.oldPrice)}
                  </span>
                ) : null}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
