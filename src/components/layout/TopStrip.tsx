import { storeConfig } from "@/lib/store-config";

export function TopStrip() {
  return (
    <div className="bg-ink text-[11px] text-white/85 sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
        <p className="shrink-0">Cash on delivery</p>
        <p className="min-w-0 truncate text-right text-white/70">
          <span className="lg:hidden">Ship KES {storeConfig.shippingFlatKes}</span>
          <span className="hidden lg:inline">
            Delivery countrywide · Shipping KES {storeConfig.shippingFlatKes} · WhatsApp / Call{" "}
            {storeConfig.whatsappNumber}
          </span>
        </p>
      </div>
    </div>
  );
}
