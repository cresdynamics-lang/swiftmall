"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";
import {
  discountPercent,
  formatKes,
  isLowStock,
  saveAmount,
} from "@/lib/format";
import type { Product } from "@/lib/product-types";

export function ProductCard({
  product,
  variant = "default",
}: {
  product: Product;
  /** flash = compact event card */
  variant?: "default" | "flash";
}) {
  const { add } = useCart();
  const { has, toggle } = useSaved();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);
  const save = saveAmount(product.price, product.oldPrice);
  const inStock = product.stock > 0;
  const low = isLowStock(product.stock, 5);
  const needsSize = product.sizes.length > 0;
  const photo = product.images[0] ?? "/products/p01.jpg";
  const compact = variant === "flash";

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(t);
  }, [added]);

  function onAdd() {
    if (needsSize) return;
    add(product.id);
    setAdded(true);
  }

  function onBuyNow() {
    if (needsSize) {
      router.push(`/product/${product.slug}`);
      return;
    }
    add(product.id);
    router.push("/checkout");
  }

  const btn =
    compact
      ? "rounded px-0.5 py-1.5 text-[8px] font-semibold leading-none whitespace-nowrap"
      : "rounded-md px-1 py-2 text-[10px] font-semibold leading-none whitespace-nowrap sm:px-2 sm:text-xs";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/8 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <Image
            src={photo}
            alt={product.name}
            fill
            className="object-contain p-1.5 transition duration-300 group-hover:scale-[1.02] sm:p-2"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 23vw"
          />
        </Link>
        {discount != null ? (
          <span
            className={`absolute left-1.5 top-1.5 w-fit rounded bg-brand font-bold text-ink ${
              compact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[11px]"
            }`}
          >
            -{discount}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => toggle(product.id)}
          className={`absolute right-1.5 top-1.5 flex items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white ${
            compact ? "h-7 w-7" : "h-8 w-8"
          }`}
          aria-label={has(product.id) ? "Remove from saved" : "Save for later"}
        >
          <Heart filled={has(product.id)} />
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-2" : "p-3"}`}>
        <Link
          href={`/product/${product.slug}`}
          className={`line-clamp-2 font-medium leading-snug text-ink hover:underline ${
            compact ? "text-[11px]" : "text-sm"
          }`}
        >
          {product.name}
        </Link>

        {/* Row 1: original (struck) then sale price */}
        <div
          className={`mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0 ${
            compact ? "text-[11px]" : "text-sm"
          }`}
        >
          {product.oldPrice && discount != null ? (
            <span className="text-ink/40 line-through">
              {formatKes(product.oldPrice)}
            </span>
          ) : null}
          <span className={`font-display font-bold text-ink ${compact ? "text-xs" : "text-base"}`}>
            {formatKes(product.price)}
          </span>
        </div>

        {/* Row 2: Save + stock */}
        <div
          className={`mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {save != null ? (
            <span className="font-bold text-ink">Save {formatKes(save)}</span>
          ) : null}
          {inStock ? (
            low ? (
              <span className="font-semibold text-orange-600">Only {product.stock} left</span>
            ) : (
              <span className="text-stock">In stock</span>
            )
          ) : (
            <span className="text-red-600">Out of stock</span>
          )}
        </div>

        {low && inStock && !compact ? (
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${Math.max(8, (product.stock / 5) * 100)}%` }}
            />
          </div>
        ) : null}

        <div className={`mt-auto grid grid-cols-2 gap-1 ${compact ? "pt-2" : "pt-3"}`}>
          {!inStock ? (
            <button
              type="button"
              disabled
              className={`col-span-2 bg-ink/10 text-ink/40 ${btn}`}
            >
              Sold out
            </button>
          ) : needsSize ? (
            <Link
              href={`/product/${product.slug}`}
              className={`col-span-2 bg-brand text-center text-ink hover:bg-brand-dark ${btn}`}
            >
              Choose size
            </Link>
          ) : added ? (
            <Link
              href="/cart"
              className={`col-span-2 bg-ink text-center text-brand ${btn}`}
            >
              ✓ View cart
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={onBuyNow}
                className={`bg-ink text-white hover:bg-ink/90 ${btn}`}
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={onAdd}
                className={`bg-brand text-ink hover:bg-brand-dark ${btn}`}
              >
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7.2-4.35-9.6-8.4C.6 9.3 2.1 6 5.4 6c1.8 0 3.3 1.05 3.9 2.55C9.9 7.05 11.4 6 13.2 6c3.3 0 4.8 3.3 3 6.6C19.2 16.65 12 21 12 21z"
        fill={filled ? "#FFC400" : "none"}
        stroke="#0B0B0B"
        strokeWidth="1.6"
      />
    </svg>
  );
}
