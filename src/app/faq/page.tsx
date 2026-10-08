import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, isTrustPageLive } from "@/lib/business";

export const metadata: Metadata = {
  title: "FAQ | Swift Mall",
  description:
    "Answers about ordering, payment, delivery and returns at Swift Mall. Pay on delivery. Flat KES 250 countrywide.",
  robots: isTrustPageLive("faq") ? { index: true, follow: true } : { index: false, follow: false },
};

const faqs = [
  {
    group: "Ordering",
    items: [
      {
        q: "Do I have to pay before I get my order?",
        a: "No, if you choose pay on delivery. You can also pay now with M-Pesa or pay a deposit.",
      },
      {
        q: "Can I order on WhatsApp instead of the website?",
        a: `Yes. Message us on WhatsApp ${business.whatsapp} with the product name. We will confirm stock, price and delivery.`,
      },
      {
        q: "How do I track my order?",
        a: "Use Track my order on the website with your order number and email, or ask us on WhatsApp.",
      },
    ],
  },
  {
    group: "Payment",
    items: [
      {
        q: "Can I check the item before I pay?",
        a: "Yes, if you choose pay on delivery. Check the item with the rider before you pay.",
      },
      {
        q: "How do I know the Paybill is really yours?",
        a: `We only ask for Paybill ${business.payments.paybill}, account ${business.payments.accountNumber}. If anyone asks for another number, call ${business.phone}.`,
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      {
        q: "How much is delivery?",
        a: `Delivery is a flat KES ${business.shippingFlatKes} countrywide.`,
      },
      {
        q: "What if I am not at home on delivery day?",
        a: `Call or WhatsApp us on ${business.phone} so we can arrange another attempt. Keep your phone on.`,
      },
    ],
  },
  {
    group: "Returns",
    items: [
      {
        q: "What if the item is wrong or damaged?",
        a: `Tell the rider if you can, then WhatsApp us on ${business.whatsapp} with your order number and a photo. We will tell you the next step.`,
      },
    ],
  },
  {
    group: "Products",
    items: [
      {
        q: "Are the prices on the site the prices I pay?",
        a: "Yes. The cart total at checkout, plus the flat delivery fee when it applies, is what you pay.",
      },
    ],
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((g) =>
      g.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrustPageShell
        title="Frequently asked questions"
        summary="Short answers about ordering, payment, delivery and returns."
      >
        {faqs.map((group) => (
          <TrustSection key={group.group} title={group.group}>
            <dl className="space-y-4">
              {group.items.map((item) => (
                <div key={item.q}>
                  <dt className="font-semibold text-ink">{item.q}</dt>
                  <dd className="mt-1 text-ink/75">{item.a}</dd>
                </div>
              ))}
            </dl>
          </TrustSection>
        ))}
        <p>
          Still stuck? See{" "}
          <Link href="/how-to-order" className="font-semibold underline">
            How to order
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="font-semibold underline">
            Contact
          </Link>
          .
        </p>
      </TrustPageShell>
    </>
  );
}
