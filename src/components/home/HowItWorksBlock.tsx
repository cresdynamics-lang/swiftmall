import Link from "next/link";
import { business } from "@/lib/business";

export function HowItWorksBlock() {
  const steps = [
    {
      n: "1",
      title: "Pick your item",
      text: "Choose the product, then size if asked, and add it to your cart.",
    },
    {
      n: "2",
      title: "Delivery or pickup",
      text: "Name, phone and delivery area — or collect at our Nairobi shop. No account needed.",
    },
    {
      n: "3",
      title: "Choose how to pay",
      text: "Pay on delivery or at pickup, pay now with M-Pesa, or pay a deposit on delivery orders.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-3 py-10 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
          Order in three steps
        </h2>
        <Link href="/how-to-order" className="text-sm font-semibold text-ink underline">
          Full guide →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((s) => (
          <div
            key={s.n}
            className="min-w-0 rounded-xl bg-white p-2.5 ring-1 ring-ink/8 sm:p-5"
          >
            <p className="font-display text-lg font-bold text-brand sm:text-2xl">{s.n}</p>
            <p className="mt-1 text-xs font-semibold leading-tight text-ink sm:mt-2 sm:text-base">
              {s.title}
            </p>
            <p className="mt-1 text-[10px] leading-snug text-ink/60 sm:text-sm">{s.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink/55">
        Order, inspect, then pay. Delivered countrywide for KES {business.shippingFlatKes}.
      </p>
    </section>
  );
}
