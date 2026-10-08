import Link from "next/link";
import { business } from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/store-config";

export function TopStrip() {
  return (
    <div className="bg-ink text-[11px] text-white/85 sm:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-4">
        <Link href="/payments" className="shrink-0 hover:text-brand">
          Cash on delivery
        </Link>
        <p className="min-w-0 truncate text-right text-white/70">
          <Link href="/delivery" className="lg:hidden hover:text-white">
            Ship KES {business.shippingFlatKes}
          </Link>
          <span className="hidden lg:inline">
            <Link href="/delivery" className="hover:text-white">
              Delivery countrywide · Flat KES {business.shippingFlatKes}
            </Link>
            {" · "}
            <a href={whatsappHref()} className="hover:text-white">
              WhatsApp
            </a>
            {" / "}
            <a href={telHref()} className="hover:text-white">
              Call {business.phone}
            </a>
          </span>
        </p>
      </div>
    </div>
  );
}
