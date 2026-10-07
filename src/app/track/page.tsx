"use client";

import { useState } from "react";

export default function TrackPage() {
  const [order, setOrder] = useState("");
  const [phone, setPhone] = useState("");
  const [shown, setShown] = useState(false);

  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Track my order</h1>
      <p className="mt-2 text-sm text-ink/55">
        Works for guests too - use your order number and phone.
      </p>
      <form
        className="mt-6 space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink/8"
        onSubmit={(e) => {
          e.preventDefault();
          setShown(true);
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Order #</span>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            required
            placeholder="e.g. 1042"
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            type="tel"
            placeholder="07XX XXX XXX"
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Track
        </button>
      </form>

      {shown && (
        <ol className="mt-6 space-y-3 rounded-xl bg-white p-5 text-sm ring-1 ring-ink/8">
          {[
            "Order placed",
            "Confirmed and packed",
            "Dispatched · carrier to confirm",
            "Delivered",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  i === 0 ? "bg-brand text-ink" : "bg-ink/10 text-ink/50"
                }`}
              >
                {i + 1}
              </span>
              <span className={i === 0 ? "font-semibold text-ink" : "text-ink/55"}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
