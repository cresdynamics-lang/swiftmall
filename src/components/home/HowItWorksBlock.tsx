import Link from "next/link";

export function HowItWorksBlock() {
  const steps = [
    {
      n: "1",
      title: "Pick your item",
      text: "Choose the product, then size if asked, and add it to your cart.",
    },
    {
      n: "2",
      title: "Tell us where to deliver",
      text: "Name, phone and delivery area. No account needed.",
    },
    {
      n: "3",
      title: "Choose how to pay",
      text: "Pay on delivery, pay now with M-Pesa, or pay a deposit.",
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
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
            <p className="font-display text-2xl font-bold text-brand">{s.n}</p>
            <p className="mt-2 font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-sm text-ink/60">{s.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink/55">
        Order, inspect, then pay. Delivered countrywide for KES 250.
      </p>
    </section>
  );
}
