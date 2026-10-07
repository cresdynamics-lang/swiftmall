import Link from "next/link";
import { storeConfig, whatsappHref } from "@/lib/store-config";

const blocks = [
  {
    title: "How to order",
    hint: "Add, checkout, pay",
    href: "/help/how-to-order",
  },
  {
    title: "Delivery",
    hint: `By ${storeConfig.carriers.slice(0, 2).join(", ")}...`,
    href: "/help/delivery",
  },
  {
    title: "Payment",
    hint: `Paybill ${storeConfig.payments.paybill}`,
    href: "/help/payment",
  },
  {
    title: "Questions?",
    hint: `WhatsApp ${storeConfig.whatsappNumber}`,
    href: whatsappHref(),
  },
];

export function TrustStrip() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b) => (
          <Link
            key={b.title}
            href={b.href}
            className="rounded-xl bg-white p-5 ring-1 ring-ink/8 transition hover:shadow-md"
            {...(b.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <p className="font-display text-base font-bold text-ink">{b.title}</p>
            <p className="mt-1 text-sm text-ink/55">{b.hint}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
