"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { Logo } from "@/components/layout/Logo";
import { formatKes } from "@/lib/format";
import { KENYA_COUNTIES } from "@/lib/counties";
import {
  paymentLabels,
  storeConfig,
  type PaymentMethod,
} from "@/lib/store-config";

export default function CheckoutPage() {
  const router = useRouter();
  const { byId } = useProducts();
  const { lines, itemCount, subtotal, shipping, total, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>(storeConfig.payments.defaultMethod);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    county: "Nairobi",
    town: "",
    address: "",
    carrier: "",
  });

  const depositNow = Math.round(total * storeConfig.depositShare);
  const payLabel =
    method === "deposit"
      ? `Place Order · Deposit ${formatKes(depositNow)}`
      : method === "pay_on_order"
        ? `Place Order · Pay ${formatKes(total)}`
        : `Place Order · ${formatKes(total)} on delivery`;

  const lineItems = useMemo(
    () =>
      lines
        .map((l) => {
          const p = byId(l.productId);
          return p ? { product: p, qty: l.qty } : null;
        })
        .filter(Boolean) as {
        product: NonNullable<ReturnType<typeof byId>>;
        qty: number;
      }[],
    [lines, byId],
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitted(true);
    clear();
    router.push("/checkout/done");
  }

  if (submitted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <p className="text-xs text-white/70 sm:text-sm">
            {`Secure checkout · WhatsApp / Call ${storeConfig.whatsappNumber}`}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <p className="mb-4 text-sm font-medium text-ink/50">
          <Link href="/cart" className="hover:text-ink">
            1 Cart
          </Link>
          <span className="mx-2">›</span>
          <span className="text-ink">2 Checkout</span>
          <span className="mx-2">›</span>
          <span>3 Done</span>
        </p>

        {itemCount === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center ring-1 ring-ink/8">
            <p className="text-ink/60">Nothing to check out yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-semibold text-ink underline">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <div className="mb-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-brand px-3 py-1 font-semibold text-ink">
                    Checkout as guest
                  </span>
                  <Link
                    href="/account"
                    className="rounded-full bg-ink/[0.05] px-3 py-1 text-ink/70"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/account"
                    className="rounded-full bg-ink/[0.05] px-3 py-1 text-ink/70"
                  >
                    Create account
                  </Link>
                </div>
                <p className="text-xs text-ink/45">
                  An account saves your details for next time. It is never required.
                </p>
              </div>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold text-ink">1 Your details</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Full name *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="e.g. Jane Wanjiru"
                    required
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Phone number *"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="07XX XXX XXX (M-Pesa number)"
                    type="tel"
                    required
                  />
                  <Field
                    label="Email address *"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    placeholder="you@example.com"
                    type="email"
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold text-ink">2 Delivery</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm sm:col-span-1">
                    <span className="mb-1 block font-medium text-ink/80">County *</span>
                    <select
                      required
                      value={form.county}
                      onChange={(e) => setForm({ ...form, county: e.target.value })}
                      className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
                    >
                      {KENYA_COUNTIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Town / area *"
                    value={form.town}
                    onChange={(v) => setForm({ ...form, town: v })}
                    placeholder="e.g. Kasarani"
                    required
                  />
                  <Field
                    label="Delivery address *"
                    value={form.address}
                    onChange={(v) => setForm({ ...form, address: v })}
                    placeholder="Street, building, landmark"
                    required
                    className="sm:col-span-2"
                  />
                  <Field
                    label="Preferred carrier or pick-up point (outside Nairobi)"
                    value={form.carrier}
                    onChange={(v) => setForm({ ...form, carrier: v })}
                    placeholder="e.g. Guardian Angel Coach, Easy Coach..."
                    className="sm:col-span-2"
                  />
                </div>
              </fieldset>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold text-ink">
                  3 How would you like to pay?
                </legend>
                <div className="mt-3 space-y-2">
                  {(Object.keys(paymentLabels) as PaymentMethod[]).map((key) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                        method === key
                          ? "border-brand bg-brand/10"
                          : "border-ink/10 hover:border-ink/20"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={method === key}
                        onChange={() => setMethod(key)}
                        className="mt-1 accent-[#FFC400]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-ink">
                          {paymentLabels[key].title}
                          {key === "deposit" ? ` · ${formatKes(depositNow)} now` : ""}
                        </span>
                        <span className="block text-xs text-ink/55">
                          {paymentLabels[key].hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {method === "pay_on_order" && (
                  <div className="mt-4 rounded-lg bg-ink/[0.04] p-3 text-sm text-ink/80">
                    <p className="font-semibold text-ink">M-Pesa / bank payment details</p>
                    <p className="mt-1">
                      Paybill: <strong>{storeConfig.payments.paybill}</strong>
                    </p>
                    <p className="mt-0.5">
                      Account: <strong>{storeConfig.payments.bankAccount}</strong>
                    </p>
                    <p className="mt-2 text-xs text-ink/50">
                      Pay and share the confirmation. Need help? WhatsApp / call{" "}
                      {storeConfig.whatsappNumber}.
                    </p>
                  </div>
                )}
              </fieldset>
            </div>

            <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:sticky lg:top-6">
              <h2 className="font-display text-base font-bold text-ink">Your order</h2>
              <ul className="mt-3 space-y-3">
                {lineItems.map(({ product, qty }) => (
                  <li key={product.id} className="flex gap-2 text-sm">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ink/[0.04]">
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium text-ink">{product.name}</p>
                      <p className="text-xs text-ink/50">Qty {qty}</p>
                    </div>
                    <p className="font-semibold">{formatKes(product.price * qty)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-ink/10 pt-3 text-sm">
                <div className="flex justify-between text-ink/70">
                  <span>Subtotal</span>
                  <span>{formatKes(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>Shipping (flat)</span>
                  <span>{formatKes(shipping)}</span>
                </div>
                <div className="flex justify-between font-display text-base font-bold text-ink">
                  <span>Total</span>
                  <span>{formatKes(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
              >
                {payLabel}
              </button>
              <Link
                href="/"
                className="mt-2 block text-center text-sm font-medium text-ink/70 hover:text-ink"
              >
                ← Continue Shopping
              </Link>
              <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
                By placing the order you agree to the terms and allow us to contact you about this
                order. Your details are used only for delivery.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-ink/80">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
