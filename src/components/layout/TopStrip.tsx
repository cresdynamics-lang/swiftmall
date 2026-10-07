import { storeConfig } from "@/lib/store-config";

export function TopStrip() {
  return (
    <div className="bg-ink text-[11px] text-white/85 sm:text-xs">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="truncate">Cash on delivery</p>
        <p className="truncate text-white/70">
          Delivery countrywide · Shipping KES {storeConfig.shippingFlatKes} · WhatsApp / Call{" "}
          {storeConfig.whatsappNumber}
        </p>
      </div>
    </div>
  );
}
