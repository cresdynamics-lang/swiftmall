"use client";

import Image from "next/image";
import Link from "next/link";
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
  /** flash = event card (one badge, Save line, stock bar ≤5) */
  variant?: "default" | "flash";
}) {
  const { add } = useCart();
  const { has, toggle } = useSaved();
  const [added, setAdded] = useState(false);
  const discount = discountPercent(product.price, product.oldPrice);
  const save = saveAmount(product.price, product.oldPrice);
  const inStock = product.stock > 0;
  const low = isLowStock(product.stock, 5);
  const needsSize = product.sizes.length > 0;
  const photo = product.images[0] ?? "/products/p01.jpg";

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

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/8 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <Image
            src={photo}
            alt={product.name}
            fill
            className="object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 23vw"
          />
        </Link>
        {discount != null ? (
          <span className="absolute left-2 top-2 w-fit rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-ink">
            -{discount}%
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => toggle(product.id)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
          aria-label={has(product.id) ? "Remove from saved" : "Save for later"}
        >
          <Heart filled={has(product.id)} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug text-ink hover:underline"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">
            {formatKes(product.price)}
          </span>
          {product.oldPrice && discount != null ? (
            <span className="text-xs text-ink/40 line-through">
              {formatKes(product.oldPrice)}
            </span>
          ) : null}
        </div>

        {save != null ? (
          <p className="mt-0.5 text-xs font-bold text-ink">Save {formatKes(save)}</p>
        ) : null}

        {inStock ? (
          low ? (
            <div className="mt-1.5">
              <p className="text-xs font-semibold text-orange-600">
                Only {product.stock} left
              </p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${Math.max(8, (product.stock / 5) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-1 text-xs text-stock">In stock</p>
          )
        ) : (
          <p className="mt-1 text-xs text-red-600">Out of stock</p>
        )}

        <div className="mt-auto pt-3">
          {!inStock ? (
            <button
              type="button"
              disabled
              className="w-full rounded-md bg-ink/10 py-2.5 text-sm font-semibold text-ink/40"
            >
              Sold out
            </button>
          ) : needsSize ? (
            <Link
              href={`/product/${product.slug}`}
              className="block w-full rounded-md bg-brand py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-brand-dark"
            >
              Choose size
            </Link>
          ) : added ? (
            <Link
              href="/cart"
              className="block w-full rounded-md bg-ink py-2.5 text-center text-sm font-semibold text-brand"
            >
              ✓ Added · View cart
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="w-full rounded-md bg-brand py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21s-7.2-4.35-9.6-8.4C.6 9.3 2.1 6 5.4 6c1.8 0 3.3 1.05 3.9 2.55C9.9 7.05 11.4 6 13.2 6c3.3 0 4.8 3.3 3 6.6C19.2 16.65 12 21 12 21z"
        fill={filled ? "#FFC400" : "none"}
        stroke="#0B0B0B"
        strokeWidth="1.6"
      />
    </svg>
  );
}
