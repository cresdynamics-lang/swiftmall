"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { submitCheckout } from "@/app/checkout/actions";
import { MetaInitiateCheckout } from "@/components/analytics/MetaInitiateCheckout";
import { Logo } from "@/components/layout/Logo";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import {
  business,
  deliveryFeeForZone,
  deliveryPromiseForZone,
  shopAddressDisplay,
  shopHoursDisplay,
  zoneForCounty,
} from "@/lib/business";
import { KENYA_COUNTIES } from "@/lib/counties";
import { formatKes } from "@/lib/format";
import { priceForProduct } from "@/lib/product-price";
import { paymentLabels, storeConfig, type PaymentMethod } from "@/lib/store-config";

export default function CheckoutPage() {
  const router = useRouter();
  const { byId } = useProducts();
  const { lines, itemCount, subtotal, clear } = useCart();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [method, setMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}`,
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    county: "Nairobi",
    town: "",
    streetBuilding: "",
    landmark: "",
    deliveryNotes: "",
    collectorName: "",
    mpesaCode: "",
    privacyConsent: false,
  });

  const zone = zoneForCounty(form.county);
  const shipping =
    itemCount === 0
      ? 0
      : fulfilment === "pickup"
        ? business.pickup.feeKes
        : deliveryFeeForZone(zone);
  const total = subtotal + shipping;
  const depositNow = Math.round(total * business.payments.depositShare);
  const balance = total - depositNow;

  const deliveryMethods: PaymentMethod[] = ["cash_on_delivery", "pay_now", "deposit"];
  const pickupMethods: PaymentMethod[] = ["cash_on_delivery", "pay_now"];
  const methods = fulfilment === "pickup" ? pickupMethods : deliveryMethods;

  const payMethod =
    fulfilment === "pickup" && method === "deposit" ? "cash_on_delivery" : method;
  const needsMpesa = payMethod === "pay_now" || payMethod === "deposit";
  const mpesaAmount = payMethod === "deposit" ? depositNow : total;

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
    fd.set("paymentMethod", payMethod);
    fd.set("fulfilment", fulfilment);
    fd.set("idempotencyKey", idempotencyKey);
    fd.set("privacyConsent", form.privacyConsent ? "true" : "false");
    startTransition(async () => {
      try {
        const result = await submitCheckout(fd);
        clear();
        const q = new URLSearchParams({
          order: String(result.orderNumber),
          token: result.trackingToken,
        });
        if (form.email.trim()) q.set("email", form.email.trim().toLowerCase());
        router.push(`/checkout/done?${q.toString()}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not place order");
      }
    });
  }

  const payLabel =
    payMethod === "deposit"
      ? `Place order · Pay now ${formatKes(depositNow)}`
      : payMethod === "pay_now"
        ? `Place order · Pay ${formatKes(total)}`
        : fulfilment === "pickup"
          ? "Place order · Pay when you collect"
          : "Place order · Pay on delivery";

  return (
    <div className="min-h-screen bg-page">
      {itemCount > 0 ? <MetaInitiateCheckout /> : null}
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Logo />
          <p className="text-xs text-white/70 sm:text-sm">
            Secure checkout · {storeConfig.whatsappNumber}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <p className="mb-4 text-sm font-medium text-ink/50">
          <Link href="/" className="hover:text-ink">
            Continue browsing
          </Link>
          <span className="mx-2">›</span>
          <span className="text-ink">Checkout</span>
        </p>

        {itemCount === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center ring-1 ring-ink/8">
            <p className="text-ink/60">Nothing to check out yet.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-semibold underline">
              Continue browsing
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="space-y-5">
              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold">1 Your details</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Field
                    name="name"
                    label="Full name *"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    required
                    className="sm:col-span-2"
                  />
                  <Field
                    name="phone"
                    label="Kenyan phone *"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="07XX XXX XXX"
                    type="tel"
                    required
                  />
                  <Field
                    name="email"
                    label="Email (for confirmation & tracking)"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    type="email"
                    placeholder="Optional but encouraged"
                  />
                </div>
                <label className="mt-3 flex items-start gap-2 text-xs text-ink/70">
                  <input
                    type="checkbox"
                    checked={form.privacyConsent}
                    onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })}
                    className="mt-0.5 accent-[#FFC400]"
                    required
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/help/privacy" className="underline">
                      Privacy notice
                    </Link>
                    . No account needed.
                  </span>
                </label>
              </fieldset>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold">2 Delivery or pickup</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["delivery", "Delivery"],
                      ["pickup", "Pickup at the shop"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setFulfilment(key);
                        if (key === "pickup" && method === "deposit") {
                          setMethod("cash_on_delivery");
                        }
                      }}
                      className={`rounded-lg border px-3 py-3 text-left text-sm font-semibold ${
                        fulfilment === key
                          ? "border-brand bg-brand/15"
                          : "border-ink/10 hover:border-ink/20"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {fulfilment === "delivery" ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">County *</span>
                      <select
                        name="county"
                        required
                        value={form.county}
                        onChange={(e) => setForm({ ...form, county: e.target.value })}
                        className="w-full rounded-md border border-ink/15 px-3 py-2.5"
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
                      required
                    />
                    <Field
                      name="streetBuilding"
                      label="Street and building *"
                      value={form.streetBuilding}
                      onChange={(v) => setForm({ ...form, streetBuilding: v })}
                      required
                      className="sm:col-span-2"
                    />
                    <Field
                      name="landmark"
                      label="Landmark"
                      value={form.landmark}
                      onChange={(v) => setForm({ ...form, landmark: v })}
                      className="sm:col-span-2"
                    />
                    <Field
                      name="deliveryNotes"
                      label="Notes for delivery"
                      value={form.deliveryNotes}
                      onChange={(v) => setForm({ ...form, deliveryNotes: v })}
                      className="sm:col-span-2"
                    />
                    <p className="sm:col-span-2 text-xs text-ink/60">
                      Delivery fee {formatKes(shipping)}. {deliveryPromiseForZone(zone)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2 text-sm text-ink/75">
                    <p className="font-medium text-ink">{shopAddressDisplay()}</p>
                    <p>Hours: {shopHoursDisplay()}</p>
                    <p>{business.pickup.collectHint}</p>
                    <p className="text-xs">{business.pickup.afterHoursNote}</p>
                    <p className="text-xs">Pickup fee {formatKes(0)}.</p>
                    <Field
                      name="collectorName"
                      label="Name of person collecting *"
                      value={form.collectorName}
                      onChange={(v) => setForm({ ...form, collectorName: v })}
                      required
                    />
                  </div>
                )}
              </fieldset>

              <fieldset className="rounded-xl bg-white p-4 ring-1 ring-ink/8 sm:p-5">
                <legend className="font-display text-base font-bold">3 How to pay</legend>
                <div className="mt-3 space-y-2">
                  {methods.map((key) => {
                    const title =
                      fulfilment === "pickup" && key === "cash_on_delivery"
                        ? "Pay when you collect"
                        : paymentLabels[key].title;
                    const hint =
                      fulfilment === "pickup" && key === "cash_on_delivery"
                        ? "Inspect the item at the shop, then pay."
                        : key === "deposit"
                          ? `Pay now ${formatKes(depositNow)}, balance on delivery ${formatKes(balance)}.`
                          : key === "cash_on_delivery"
                            ? "When the rider arrives, check that the item matches your order, then pay."
                            : paymentLabels[key].hint;
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                          payMethod === key
                            ? "border-brand bg-brand/10"
                            : "border-ink/10 hover:border-ink/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={payMethod === key}
                          onChange={() => setMethod(key)}
                          className="mt-1 accent-[#FFC400]"
                        />
                        <span>
                          <span className="block text-sm font-semibold">{title}</span>
                          <span className="block text-xs text-ink/55">{hint}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {needsMpesa ? (
                  <div className="mt-4 rounded-lg bg-ink p-4 text-sm text-white">
                    <p className="font-display text-base font-bold text-brand">
                      Pay now (M-Pesa)
                    </p>
                    <p className="mt-2 text-white/90">
                      Lipa na M-Pesa, Paybill {business.payments.paybill}, Account{" "}
                      {business.payments.accountNumber}, Amount:{" "}
                      <strong className="text-brand">{formatKes(mpesaAmount)}</strong>
                    </p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-white/85">
                      <li>M-Pesa → Lipa na M-Pesa → Pay Bill</li>
                      <li>Business number: {business.payments.paybill}</li>
                      <li>Account: {business.payments.accountNumber}</li>
                      <li>Amount: {formatKes(mpesaAmount)}</li>
                      <li>Enter your PIN and confirm</li>
                    </ol>
                    <p className="mt-3 text-xs text-white/55">
                      Confirm the business name on your M-Pesa screen before you finish. If it does
                      not look right, stop and call {business.phone}.{" "}
                      {business.brandName} will never ask for your M-Pesa PIN.
                    </p>
                    <label className="mt-3 block text-xs text-white/80">
                      M-Pesa confirmation code (optional claim — we confirm in admin)
                      <input
                        name="mpesaCode"
                        value={form.mpesaCode}
                        onChange={(e) => setForm({ ...form, mpesaCode: e.target.value })}
                        className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                        placeholder="e.g. QH7…"
                      />
                    </label>
                  </div>
                ) : null}
              </fieldset>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>

            <aside className="h-fit rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:sticky lg:top-6">
              <h2 className="font-display text-base font-bold">Order breakdown</h2>
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
                      <p className="line-clamp-2 font-medium">{product.name}</p>
                      <p className="text-xs text-ink/50">
                        Qty {qty}
                        {size ? ` · ${size}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatKes(priceForProduct(product, size) * qty)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1 border-t border-ink/10 pt-3 text-sm">
                <div className="flex justify-between text-ink/70">
                  <span>Subtotal</span>
                  <span>{formatKes(subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>{fulfilment === "pickup" ? "Pickup" : "Delivery"}</span>
                  <span>{formatKes(shipping)}</span>
                </div>
                <div className="flex justify-between font-display text-base font-bold">
                  <span>Total</span>
                  <span>{formatKes(total)}</span>
                </div>
                {payMethod === "deposit" ? (
                  <p className="pt-1 text-xs text-ink/60">
                    Pay now {formatKes(depositNow)}, balance on delivery {formatKes(balance)}.
                  </p>
                ) : null}
                {fulfilment === "delivery" ? (
                  <p className="pt-2 text-xs text-ink/55">{deliveryPromiseForZone(zone)}</p>
                ) : (
                  <p className="pt-2 text-xs text-ink/55">{shopHoursDisplay()}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={pending}
                className="mt-5 w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
              >
                {pending ? "Placing order…" : payLabel}
              </button>
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
