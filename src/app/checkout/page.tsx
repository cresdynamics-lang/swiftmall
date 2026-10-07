"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { submitCheckout } from "@/app/checkout/actions";
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

const CHECKOUT_METHODS = storeConfig.payments.methods;

export default function CheckoutPage() {
  const router = useRouter();
  const { byId } = useProducts();
  const { lines, itemCount, subtotal, shipping, total, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethod>(storeConfig.payments.defaultMethod);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    county: "Nairobi",
    town: "",
    address: "",
  });

  const depositNow = Math.round(total * storeConfig.depositShare);
  const mpesaAmount = method === "deposit" ? depositNow : total;
  const needsMpesa = method === "pay_now" || method === "deposit";

  const payLabel =
    method === "deposit"
      ? `Submit order · Deposit ${formatKes(depositNow)}`
      : method === "pay_now"
        ? `Submit order · Pay ${formatKes(total)}`
        : `Submit order · Cash on delivery`;

  const lineItems = useMemo(
    () =>
      lines
        .map((l) => {
          const p = byId(l.productId);
          return p ? { product: p, qty: l.qty, size: l.size } : null;
        })
        .filter(Boolean) as {
        product: NonNullable<ReturnType<typeof byId>>;
        qty: number;
        size?: string;
      }[],
    [lines, byId],
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("lines", JSON.stringify(lines));
    fd.set("paymentMethod", method);
    startTransition(async () => {
      try {
        const result = await submitCheckout(fd);
        const email = encodeURIComponent(form.email.trim().toLowerCase());
        clear();
        router.push(`/checkout/done?order=${result.orderNumber}&email=${email}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not place order");
      }
    });
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
          <Link href="/" className="hover:text-ink" onClick={() => {}}>
            Continue browsing
          </Link>
          <span className="mx-2">›</span>
          <span className="text-ink">Checkout</span>
          <span className="mx-2">›</span>
          <span>Done</span>
        </p>

        {itemCount === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center ring-1 ring-ink/8">
            <p className="text-ink/60">Nothing to check out yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-semibold text-ink underline">
              Continue Browsing
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold text-ink">1 Your details</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    name="name"
                    label="Full name *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="e.g. Jane Wanjiru"
                    required
                    className="sm:col-span-2"
                  />
                  <Field
                    name="phone"
                    label="Phone number *"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="07XX XXX XXX (M-Pesa number)"
                    type="tel"
                    required
                  />
                  <Field
                    name="email"
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
                      name="county"
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
                    name="town"
                    label="Town / area *"
                    value={form.town}
                    onChange={(v) => setForm({ ...form, town: v })}
                    placeholder="e.g. Kasarani"
                    required
                  />
                  <Field
                    name="address"
                    label="Delivery address *"
                    value={form.address}
                    onChange={(v) => setForm({ ...form, address: v })}
                    placeholder="Street, building, landmark"
                    required
                    className="sm:col-span-2"
                  />
                </div>
                <p className="mt-3 text-xs text-ink/50">
                  We arrange shipping and will contact you on WhatsApp or phone with delivery
                  updates.
                </p>
              </fieldset>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold text-ink">
                  3 How would you like to pay?
                </legend>
                <div className="mt-3 space-y-2">
                  {CHECKOUT_METHODS.map((key) => (
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
                          {key === "pay_now" ? ` · ${formatKes(total)}` : ""}
                        </span>
                        <span className="block text-xs text-ink/55">
                          {paymentLabels[key].hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>

                {needsMpesa ? (
                  <div className="mt-4 rounded-lg bg-ink p-4 text-sm text-white">
                    <p className="font-display text-base font-bold text-brand">
                      Pay via M-Pesa
                    </p>
                    <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/90">
                      <li>Go to M-Pesa on your phone</li>
                      <li>Select Lipa na M-Pesa</li>
                      <li>Select Pay Bill</li>
                      <li>
                        Business number:{" "}
                        <strong className="text-brand">{storeConfig.payments.paybill}</strong>
                      </li>
                      <li>
                        Account number:{" "}
                        <strong className="text-brand">{storeConfig.payments.bankAccount}</strong>
                      </li>
                      <li>
                        Amount:{" "}
                        <strong className="text-brand">{formatKes(mpesaAmount)}</strong>
                        {method === "deposit" ? " (deposit)" : ""}
                      </li>
                      <li>Enter your M-Pesa PIN and confirm</li>
                    </ol>
                    <p className="mt-3 text-xs text-white/55">
                      After paying, submit your order below. We will confirm payment and arrange
                      delivery.
                    </p>
                  </div>
                ) : null}
              </fieldset>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:sticky lg:top-6">
              <h2 className="font-display text-base font-bold text-ink">Your order</h2>
              <ul className="mt-3 space-y-3">
                {lineItems.map(({ product, qty, size }) => (
                  <li key={`${product.id}:${size ?? ""}`} className="flex gap-2 text-sm">
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
                      <p className="text-xs text-ink/50">
                        Qty {qty}
                        {size ? ` · ${size}` : ""}
                      </p>
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
                disabled={pending}
                className="mt-4 w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
              >
                {pending ? "Submitting…" : payLabel}
              </button>
              <Link
                href="/"
                className="mt-2 block text-center text-sm font-medium text-ink/70 hover:text-ink"
              >
                Continue Browsing
              </Link>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  className = "",
}: {
  name: string;
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
        name={name}
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
