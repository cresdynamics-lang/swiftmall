"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatKes } from "@/lib/format";
import { products } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";

export function CartDrawer() {
  const { lines, itemCount, subtotal, shipping, total, drawerOpen, closeDrawer, setQty, remove } =
    useCart();

  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Close cart"
        onClick={closeDrawer}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-ink/10 bg-ink px-4 py-3 text-white">
          <h2 className="font-display text-lg font-bold">
            Cart{" "}
            <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-sm font-bold text-ink">
              {itemCount}
            </span>
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded p-1.5 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/55">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => {
                const p = products.find((x) => x.id === line.productId);
                if (!p) return null;
                return (
                  <li key={line.productId} className="flex gap-3">
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={closeDrawer}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-ink/[0.04]"
                    >
                      <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={closeDrawer}
                        className="line-clamp-2 text-sm font-medium text-ink hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-sm font-semibold">{formatKes(p.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex items-center rounded border border-ink/15">
                          <button
                            type="button"
                            className="px-2 py-1 text-sm"
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            aria-label="Decrease"
                          >
                            -
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold">{line.qty}</span>
                          <button
                            type="button"
                            className="px-2 py-1 text-sm"
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId)}
                          className="text-xs text-ink/45 hover:text-ink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ink">
                      {formatKes(p.price * line.qty)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-ink/10 px-4 py-4">
          <div className="mb-1 flex justify-between text-sm text-ink/70">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatKes(subtotal)}</span>
          </div>
          <div className="mb-2 flex justify-between text-sm text-ink/70">
            <span>Shipping (flat)</span>
            <span>{itemCount ? formatKes(shipping) : formatKes(0)}</span>
          </div>
          <p className="mb-2 text-[11px] text-ink/45">
            Flat rate KES {storeConfig.shippingFlatKes} countrywide
          </p>
          <div className="mb-4 flex justify-between font-display text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatKes(total)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/cart"
              onClick={closeDrawer}
              className={`rounded-md border border-ink/15 py-3 text-center text-sm font-semibold text-ink hover:bg-ink/[0.03] ${
                lines.length === 0 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              View cart
            </Link>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className={`rounded-md bg-brand py-3 text-center text-sm font-semibold text-ink hover:bg-brand-dark ${
                lines.length === 0 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-md py-2 text-sm font-medium text-ink/70 hover:text-ink"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
