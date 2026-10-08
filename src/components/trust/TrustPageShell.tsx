import Link from "next/link";
import type { ReactNode } from "react";
import { business } from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/store-config";

export function TrustPageShell({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-3 py-10 sm:px-4">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Home
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 text-sm text-ink/55">{summary}</p>
      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink/80">{children}</div>

      <div className="mt-12 rounded-xl bg-white p-5 ring-1 ring-ink/10">
        <h2 className="font-display text-lg font-bold text-ink">Talk to us</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink/75">
          <li>
            WhatsApp:{" "}
            <a
              href={whatsappHref()}
              className="font-semibold text-ink underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {business.whatsapp}
            </a>
          </li>
          <li>
            Call:{" "}
            <a href={telHref()} className="font-semibold text-ink underline">
              {business.phone}
            </a>
          </li>
          <li>
            Email:{" "}
            <a href={`mailto:${business.email}`} className="font-semibold text-ink underline">
              {business.email}
            </a>
          </li>
        </ul>
        <a
          href={whatsappHref("Hi Swift Mall, I have a question.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex min-h-12 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}

export function TrustSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}
