import Link from "next/link";
import { business, confirmedValue } from "@/lib/business";

/** Slim strip under the hero — only confirmed promises. */
export function HomeTrustStrip() {
  const returnDays = confirmedValue(business.returns.reportWithinDays);

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
    ...(returnDays != null
      ? [
          {
            title: "Returns support",
            line: `${returnDays} days to report an issue.`,
            href: "/returns",
          },
        ]
      : []),
  ];

  return (
    <section className="border-y border-ink/8 bg-white">
      <div className="mx-auto flex max-w-7xl divide-x divide-ink/8">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="min-w-0 flex-1 px-1.5 py-2.5 text-center hover:bg-page sm:px-3 sm:py-4"
          >
            <p className="text-[10px] font-semibold leading-tight text-ink sm:text-sm">
              {item.title}
            </p>
            <p className="mt-0.5 text-[9px] leading-tight text-ink/55 sm:text-xs">
              {item.line}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
