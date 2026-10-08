import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { business } from "@/lib/business";
import { storeConfig } from "@/lib/store-config";

/** Legacy help slugs → new trust URLs */
const redirects: Record<string, string> = {
  delivery: "/delivery",
  payment: "/payments",
  "how-to-order": "/how-to-order",
  returns: "/returns",
};

const pages: Record<string, { title: string; body: string[] }> = {
  terms: {
    title: "Terms",
    body: [
      "By placing an order you agree that we may contact you about that order for delivery and payment.",
      "The cart total at checkout, plus the flat delivery fee when it applies, is what you pay.",
      `Questions: WhatsApp or call ${business.phone}, or email ${business.email}.`,
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "What we collect: your name, phone number, email, delivery address and order details when you place an order or contact us.",
      "Why: to confirm your order, arrange delivery, and answer your questions.",
      "Who sees it: Swift Mall staff handling your order, and the delivery rider for your address and phone on delivery day.",
      "We do not sell customer data.",
      `How to ask for your data to be removed: email ${business.email} or WhatsApp ${business.whatsapp} with your name and phone. We will respond as required under the Kenya Data Protection Act.`,
      "Draft note for the owner or a lawyer: confirm this wording before treating it as a final legal privacy notice.",
    ],
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (redirects[slug]) return { title: "Help" };
  return { title: pages[slug]?.title ?? "Help" };
}

export default async function HelpPage({ params }: PageProps) {
  const { slug } = await params;
  if (redirects[slug]) redirect(redirects[slug]);

  const page = pages[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-3 py-10 sm:px-4">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Home
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">{page.title}</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {slug === "privacy" ? (
        <p className="mt-6 text-xs text-ink/45">
          This page is a draft for the owner or a lawyer to approve. It does not claim certified
          legal compliance.
        </p>
      ) : null}
      <p className="mt-6 text-xs text-ink/40">{storeConfig.domain}</p>
    </div>
  );
}
