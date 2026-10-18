"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { lookupOrder } from "@/app/track/actions";

export default function TrackPage() {
  const [order, setOrder] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Track my order</h1>
      <p className="mt-2 text-sm text-ink/55">
        Enter your order number and the phone you used at checkout.
      </p>
      <form
        className="mt-6 space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink/8"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const res = await lookupOrder(order, phone);
            if ("error" in res) {
              setError(res.error);
              return;
            }
            window.location.href = `/track/${res.token}`;
          });
        }}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Order number</span>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            required
            placeholder="SM-001042 or 1042"
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
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Looking up…" : "Track"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-ink/45">
        <Link href="/contact" className="underline">
          Need help?
        </Link>
      </p>
    </div>
  );
}
