import Link from "next/link";
import { isTrustPageLive } from "@/lib/business";

/** Short About teaser — only links when /about is live. */
export function AboutTeaser() {
  const aboutLive = isTrustPageLive("about");

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <div className="rounded-xl bg-ink px-5 py-8 text-white sm:px-8">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Meet Swift Mall</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
          We are a small Kenyan online shop. Every order is confirmed by a real person on call or
          WhatsApp before it leaves us. You can pay on delivery.
        </p>
        {aboutLive ? (
          <Link
            href="/about"
            className="mt-5 inline-flex rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            About us →
          </Link>
        ) : (
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Talk to us →
          </Link>
        )}
      </div>
    </section>
  );
}
