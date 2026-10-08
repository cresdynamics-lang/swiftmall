import Link from "next/link";
import { business, confirmedValue } from "@/lib/business";

/** Slim strip under the hero — only confirmed promises. */
export function HomeTrustStrip() {
  const returnHours = confirmedValue(business.returns.reportWithinHours);

  const items = [
    {
      title: "Pay on delivery",
      line: "See it first, then pay.",
      href: "/payments",
    },
    {
      title: "Countrywide delivery",
      line: `A flat KES ${business.shippingFlatKes}.`,
      href: "/delivery",
    },
    {
      title: "Confirmed by a real person",
      line: "We call or WhatsApp before dispatch.",
      href: "/how-to-order",
    },
    ...(returnHours != null
      ? [
          {
            title: "Easy swaps",
            line: `${returnHours} hours to tell us.`,
            href: "/returns",
          },
        ]
      : []),
  ];

  return (
    <section className="border-y border-ink/8 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-ink/8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-none lg:flex">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex-1 px-4 py-3 text-center hover:bg-page sm:py-4"
          >
            <p className="text-sm font-semibold text-ink">{item.title}</p>
            <p className="mt-0.5 text-xs text-ink/55">{item.line}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
