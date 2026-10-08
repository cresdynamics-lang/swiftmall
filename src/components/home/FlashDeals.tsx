"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import {
  discountPercent,
  formatKes,
  isLowStock,
  saveAmount,
} from "@/lib/format";
import type { Product } from "@/lib/product-types";

function useRealCountdown(endsAt: string | null) {
  const end = endsAt ? new Date(endsAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(end) || end <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  if (!Number.isFinite(end)) return null;
  const remaining = Math.max(0, Math.floor((end - now) / 1000));
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { remaining, h, m, s, ended: remaining <= 0 };
}

function endsLabel(endsAt: string | null): string {
  if (!endsAt) return "";
  const end = new Date(endsAt);
  const startOfTomorrow = new Date();
  startOfTomorrow.setHours(24, 0, 0, 0);
  if (end.getTime() <= startOfTomorrow.getTime()) return "Ends today";
  const week = new Date();
  week.setDate(week.getDate() + 7);
  if (end.getTime() <= week.getTime()) return "Ends this week";
  return `Ends ${end.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}`;
}

export function FlashDeals({ flashEndsAt }: { flashEndsAt: string | null }) {
  const { products } = useProducts();
  const clock = useRealCountdown(flashEndsAt);
  const railRef = useRef<HTMLDivElement>(null);

  const deals = useMemo(() => {
    const marked = products.filter((p) => p.flashDeal && p.live !== false);
    const list =
      marked.length > 0
        ? marked
        : products.filter(
            (p) => p.oldPrice != null && p.oldPrice > p.price,
          );
    return [...list].sort((a, b) => {
      const da = discountPercent(a.price, a.oldPrice) ?? 0;
      const db = discountPercent(b.price, b.oldPrice) ?? 0;
      return db - da;
    });
  }, [products]);

  const feature = deals[0];
  const rail = deals.slice(1);

  if (!flashEndsAt || clock?.ended) {
    return (
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <div className="rounded-[18px] bg-ink px-4 py-8 text-center text-white sm:px-6">
          <h2 className="font-display text-xl font-bold">⚡ Flash Sale</h2>
          <p className="mt-2 text-sm text-white/60">New deals soon</p>
          <Link
            href="/deals"
            className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Browse deals →
          </Link>
        </div>
      </section>
    );
  }

  if (deals.length === 0) return null;

  function scrollRail(dir: -1 | 1) {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-flash-card]");
    const w = card?.offsetWidth ?? 180;
    el.scrollBy({ left: dir * (w + 12), behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="rounded-[18px] bg-ink px-3 py-4 text-white sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              ⚡ Flash Sale
            </h2>
            <span className="text-xs font-semibold text-white/55">
              {endsLabel(flashEndsAt)}
            </span>
            <Link
              href="/deals"
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Shop all →
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {clock ? (
              <div className="flex items-center gap-1 font-display text-sm font-bold">
                <TimeBox value={clock.h} label="HRS" />
                <span className="text-brand">:</span>
                <TimeBox value={clock.m} label="MIN" />
                <span className="text-brand">:</span>
                <TimeBox value={clock.s} label="SEC" />
              </div>
            ) : null}
            <button
              type="button"
              aria-label="Scroll flash deals left"
              onClick={() => scrollRail(-1)}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll flash deals right"
              onClick={() => scrollRail(1)}
              className="hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
          {feature ? <DealOfTheHour product={feature} /> : null}
          <div
            ref={railRef}
            className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] snap-x snap-mandatory"
          >
            {rail.map((p) => (
              <div
                key={p.id}
                data-flash-card
                className="w-[158px] shrink-0 snap-start sm:w-[180px] lg:w-[200px]"
              >
                <ProductCard product={p} variant="flash" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-[44px] flex-col items-center rounded-md bg-brand px-2 py-1 text-ink">
      <span className="text-base leading-none">{String(value).padStart(2, "0")}</span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-wide">{label}</span>
    </div>
  );
}

function DealOfTheHour({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const pct = discountPercent(product.price, product.oldPrice);
  const save = saveAmount(product.price, product.oldPrice);
  const low = isLowStock(product.stock, 5);
  const needsSize = product.sizes.length > 0;
  const inStock = product.stock > 0;

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <div className="overflow-hidden rounded-xl bg-white text-ink ring-1 ring-white/10">
      <div className="relative aspect-[4/3] bg-ink/[0.03]">
        <Image
          src={product.images[0] ?? "/products/p01.jpg"}
          alt={product.name}
          fill
          className="object-contain p-3"
          sizes="380px"
        />
        {pct != null ? (
          <span className="absolute left-3 top-3 rounded bg-brand px-2 py-1 text-[11px] font-bold uppercase text-ink">
            Deal of the hour · -{pct}%
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded bg-brand px-2 py-1 text-[11px] font-bold uppercase text-ink">
            Deal of the hour
          </span>
        )}
      </div>
      <div className="p-4">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 font-display text-lg font-bold hover:underline"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          {product.oldPrice && pct != null ? (
            <span className="text-sm text-ink/40 line-through">
              {formatKes(product.oldPrice)}
            </span>
          ) : null}
          <span className="font-display text-2xl font-bold">
            {formatKes(product.price)}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
          {save != null ? (
            <span className="font-bold">Save {formatKes(save)}</span>
          ) : null}
          {inStock ? (
            low ? (
              <span className="font-semibold text-orange-600">
                Only {product.stock} left
              </span>
            ) : (
              <span className="text-stock">In stock</span>
            )
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>
        {needsSize ? (
          <Link
            href={`/product/${product.slug}`}
            className="mt-4 block w-full rounded-md bg-brand py-3 text-center text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Choose size
          </Link>
        ) : added ? (
          <Link
            href="/cart"
            className="mt-4 block w-full rounded-md bg-ink py-3 text-center text-sm font-semibold text-brand"
          >
            ✓ Added · View cart
          </Link>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                add(product.id);
                router.push("/checkout");
              }}
              className="rounded-md bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-40"
            >
              Buy Now
            </button>
            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                add(product.id);
                setAdded(true);
              }}
              className="rounded-md bg-brand py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-40"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
