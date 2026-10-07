"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { useSaved } from "@/context/SavedContext";
import { formatKes } from "@/lib/format";
export default function CartPage() {
  const { byId } = useProducts();
  const { lines, itemCount, subtotal, shipping, total, setQty, remove } = useCart();
  const { toggle } = useSaved();
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <p className="mb-4 text-sm font-medium text-ink/50">
        <span className="text-ink">1 Cart</span>
        <span className="mx-2">›</span>
        <span>2 Checkout</span>
        <span className="mx-2">›</span>
        <span>3 Done</span>
      </p>

      <h1 className="font-display text-2xl font-bold text-ink">
        Shopping cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      {lines.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-10 text-center ring-1 ring-ink/8">
          <p className="text-ink/60">Your cart is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {lines.map((line) => {
              const p = byId(line.productId);
              if (!p) return null;
              const lineKey = `${line.productId}:${line.size ?? ""}`;
              return (
                <div
                  key={lineKey}
                  className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-ink/8 sm:p-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/[0.04]">
                    <Image src={p.images[0]} alt="" fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${p.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-ink hover:underline"
                    >
                      {p.name}
                    </Link>
                    {line.size ? (
                      <p className="mt-0.5 text-xs font-medium text-ink/60">Size: {line.size}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-stock">
                      {p.stock <= 3 ? `Only ${p.stock} left` : "In stock"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded border border-ink/15">
                        <button
                          type="button"
                          className="px-2.5 py-1"
                          onClick={() => setQty(line.productId, line.qty - 1, line.size)}
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-sm">{line.qty}</span>
                        <button
                          type="button"
                          className="px-2.5 py-1"
                          onClick={() => setQty(line.productId, line.qty + 1, line.size)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.productId, line.size)}
                        className="text-xs text-ink/45 hover:text-ink"
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggle(line.productId);
                          remove(line.productId, line.size);
                        }}
                        className="text-xs text-ink/45 hover:text-ink"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold">{formatKes(p.price)}</p>
                    <p className="mt-1 text-xs text-ink/45">
                      Total {formatKes(p.price * line.qty)}
                    </p>
                  </div>
                </div>
              );
            })}
            <Link href="/" className="inline-block text-sm font-semibold text-ink hover:underline">
              ← Continue Shopping
            </Link>
          </div>

          <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:sticky lg:top-24">
            <h2 className="font-display text-base font-bold text-ink">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink/70">
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatKes(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Shipping (flat rate)</span>
                <span>{formatKes(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-base font-bold text-ink">
                <span>Total</span>
                <span>{formatKes(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-4 block rounded-md bg-brand py-3 text-center text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Proceed to Order
            </Link>
            <Link
              href="/"
              className="mt-2 block rounded-md border border-ink/15 py-3 text-center text-sm font-semibold text-ink hover:bg-ink/[0.03]"
            >
              Continue Browsing
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
