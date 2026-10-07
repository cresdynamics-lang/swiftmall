"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";

export function ProductActions({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const [qty, setLocalQty] = useState(1);
  const { add } = useCart();
  const { has, toggle } = useSaved();
  const router = useRouter();

  function addToCartOnly() {
    add(productId, qty);
  }

  function buyNow() {
    add(productId, qty);
    router.push("/checkout");
  }

  return (
    <div className="mt-6 space-y-3">
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
        Add to Cart opens your cart at the top. Buy now goes to checkout.
      </p>
    </div>
  );
}
