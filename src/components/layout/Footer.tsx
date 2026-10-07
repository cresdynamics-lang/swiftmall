import Link from "next/link";
import { categories } from "@/lib/categories";
import { storeConfig } from "@/lib/store-config";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-white/65">{storeConfig.tagline}</p>
          <p className="mt-2 text-xs text-white/45">
            Flat shipping KES {storeConfig.shippingFlatKes} · Countrywide delivery
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-brand">
            Shop
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/deals" className="hover:text-white">
                Deals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-brand">
            Help
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/track" className="hover:text-white">
                Track my order
              </Link>
            </li>
            <li>
              <Link href="/help/delivery" className="hover:text-white">
                Delivery
              </Link>
            </li>
            <li>
              <Link href="/help/returns" className="hover:text-white">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/help/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/help/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-brand">
            Contact
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>{storeConfig.contactEmail}</li>
            <li>
              {storeConfig.whatsappNumber
                ? `WhatsApp ${storeConfig.whatsappNumber}`
                : "WhatsApp - number coming soon"}
            </li>
            <li className="pt-2 text-xs text-white/45">
              Carriers: {storeConfig.carriers.join(" · ")}
            </li>
            <li className="text-xs text-white/45">
              Pay on order · Bank A/C {storeConfig.payments.bankAccount}
              {storeConfig.payments.paybill
                ? ` · Paybill ${storeConfig.payments.paybill}`
                : " · Paybill TBA"}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © 2026 {storeConfig.name}. {storeConfig.domain}
      </div>
    </footer>
  );
}
