"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";

export function ProductActions({
  productId,
  stock,
  sizes = [],
}: {
  productId: string;
  stock: number;
  sizes?: string[];
}) {
  const [qty, setLocalQty] = useState(1);
  const [size, setSize] = useState(sizes[0] ?? "");
  const [sizeError, setSizeError] = useState(false);
  const { add } = useCart();
  const { has, toggle } = useSaved();
  const router = useRouter();
  const needsSize = sizes.length > 0;

  function ensureSize(): boolean {
    if (needsSize && !size) {
      setSizeError(true);
      return false;
    }
    setSizeError(false);
    return true;
  }

  function addToCartOnly() {
    if (!ensureSize()) return;
    add(productId, qty, size || undefined);
  }

  function buyNow() {
    if (!ensureSize()) return;
    add(productId, qty, size || undefined);
    router.push("/checkout");
  }

  return (
    <div className="mt-6 space-y-3">
      {needsSize ? (
        <div>
          <p className="mb-2 text-sm font-medium text-ink/80">Size *</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  size === s
                    ? "border-brand bg-brand text-ink"
                    : "border-ink/15 bg-white text-ink hover:border-ink/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {sizeError ? (
            <p className="mt-1 text-xs text-red-600">Please choose a size</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center overflow-hidden rounded-md border border-ink/15 bg-white">
          <button
            type="button"
            className="px-3 py-2.5 text-base"
            onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            className="px-3 py-2.5 text-base"
            onClick={() => setLocalQty((q) => Math.min(stock, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={stock <= 0}
          onClick={addToCartOnly}
          className="flex-1 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-40 sm:flex-none"
        >
          Add to Cart
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={stock <= 0}
          onClick={buyNow}
          className="rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/[0.03] disabled:opacity-40"
        >
          Buy now
        </button>
        <button
          type="button"
          onClick={() => toggle(productId)}
          className="rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-ink/[0.03]"
        >
          {has(productId) ? "Saved" : "Save"}
        </button>
      </div>
      <p className="text-xs text-ink/45">
        Items stay in your cart until you tap the cart icon. Buy now goes straight to checkout.
      </p>
    </div>
  );
}
