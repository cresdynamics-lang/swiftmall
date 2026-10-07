"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import type { Product } from "@/lib/product-types";

export function ProductCard({ product }: { product: Product }) {
  const { add, setQty, qtyFor } = useCart();
  const { has, toggle } = useSaved();
  const qty = qtyFor(product.id);
  const discount = discountPercent(product.price, product.oldPrice);
  const promo = offerTagLabel(product);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= (product.lowStockAt ?? 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-ink/8 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-ink/[0.03]">
        <Link href={`/product/${product.slug}`} className="absolute inset-0">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="50vw"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {discount != null && (
            <span className="w-fit rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold text-brand">
              -{discount}%
            </span>
          )}
          {promo && (
            <span className="w-fit rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
              {promo}
            </span>
          )}
        </div>
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

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-base font-bold text-ink">
            {formatKes(product.price)}
          </span>
          {product.oldPrice ? (
            <span className="text-xs text-ink/40 line-through">
              {formatKes(product.oldPrice)}
            </span>
          ) : null}
        </div>

        <p className={`mt-1 text-xs ${inStock ? "text-stock" : "text-red-600"}`}>
          {lowStock ? `Only ${product.stock} left` : inStock ? "In stock" : "Out of stock"}
        </p>

        <div className="mt-auto pt-3">
          {!inStock ? (
            <button
              type="button"
              disabled
              className="w-full rounded-md bg-ink/10 py-2.5 text-sm font-semibold text-ink/40"
            >
              Out of stock
            </button>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={() => add(product.id)}
              className="w-full rounded-md bg-brand py-2.5 text-sm font-semibold text-ink transition hover:bg-brand-dark"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center overflow-hidden rounded-md bg-brand">
              <button
                type="button"
                onClick={() => setQty(product.id, qty - 1)}
                className="px-3 py-2.5 text-base font-bold text-ink hover:bg-brand-dark"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-ink">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(product.id, qty + 1)}
                className="px-3 py-2.5 text-base font-bold text-ink hover:bg-brand-dark"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
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
