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
  const outOfStock = stock <= 0;

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

      <div className="inline-flex items-center overflow-hidden rounded-md border border-ink/15 bg-white">
        <button
          type="button"
          className="px-3 py-2.5 text-base"
          onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease quantity"
          disabled={outOfStock}
        >
          -
        </button>
        <span className="min-w-8 text-center text-sm font-semibold">{qty}</span>
        <button
          type="button"
          className="px-3 py-2.5 text-base"
          onClick={() => setLocalQty((q) => Math.min(stock, q + 1))}
          aria-label="Increase quantity"
          disabled={outOfStock}
        >
          +
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={outOfStock}
          onClick={buyNow}
          className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-40"
        >
          Buy Now
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={addToCartOnly}
          className="rounded-md bg-brand px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-40"
        >
          Add to Cart
        </button>
      </div>

      <button
        type="button"
        onClick={() => toggle(productId)}
        className="text-sm font-medium text-ink/55 underline-offset-2 hover:text-ink hover:underline"
      >
        {has(productId) ? "Saved for later" : "Save for later"}
      </button>
    </div>
  );
}
