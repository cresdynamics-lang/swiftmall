"use client";

import { useState } from "react";
import { business } from "@/lib/business";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Swift Mall contact from ${name || "customer"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\n\n${message}`,
    );
    window.location.href = `mailto:${business.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium text-ink">Name</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Phone</span>
        <input
          name="phone"
          required
          type="tel"
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
      >
        Send to {business.email}
      </button>
      {sent ? (
        <p className="text-xs text-ink/55">
          Your email app should open. If it does not, write to {business.email} directly.
        </p>
      ) : null}
    </form>
  );
}
