import { storeConfig } from "@/lib/store-config";

const items = [
  { title: "Cash on delivery", hint: "Pay when it arrives" },
  { title: "Pay a deposit", hint: "Balance on delivery" },
  { title: `KES ${storeConfig.shippingFlatKes} shipping`, hint: "Countrywide, any county" },
  { title: "WhatsApp / Call", hint: storeConfig.whatsappNumber },
];

export function PromiseStrip() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3 ring-1 ring-ink/8 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-ink/8 sm:p-0">
        {items.map((item) => (
          <div key={item.title} className="px-3 py-3 sm:px-5 sm:py-4">
            <p className="font-display text-sm font-bold text-ink">{item.title}</p>
            <p className="mt-0.5 text-xs text-ink/55">{item.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
