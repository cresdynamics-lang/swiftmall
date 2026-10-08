"use client";

import Link from "next/link";
import { useCategories } from "@/context/CategoriesContext";
import { business, isTrustPageLive } from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/store-config";
import { Logo } from "./Logo";

export function Footer() {
  const categories = useCategories();
  const paybillName = business.payments.paybillDisplayName.confirmed
    ? business.payments.paybillDisplayName.value
    : null;

  return (
    <footer className="mt-auto border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-white/65">
            Order, inspect, then pay. Delivered countrywide for KES {business.shippingFlatKes}.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-brand">
            Shop
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {categories
              .filter((c) => c.slug !== "others")
              .map((c) => (
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
            {isTrustPageLive("howToOrder") ? (
              <li>
                <Link href="/how-to-order" className="hover:text-white">
                  How to order
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("delivery") ? (
              <li>
                <Link href="/delivery" className="hover:text-white">
                  Delivery
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("returns") ? (
              <li>
                <Link href="/returns" className="hover:text-white">
                  Returns
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("warranty") ? (
              <li>
                <Link href="/warranty" className="hover:text-white">
                  Warranty
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("payments") ? (
              <li>
                <Link href="/payments" className="hover:text-white">
                  Payments
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("faq") ? (
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            ) : null}
            <li>
              <Link href="/track" className="hover:text-white">
                Track my order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-brand">
            Company
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {isTrustPageLive("about") ? (
              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>
            ) : null}
            {isTrustPageLive("contact") ? (
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            ) : null}
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
          <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-brand">
            Contact
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <a href={`mailto:${business.email}`} className="hover:text-white">
                {business.email}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref()}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {business.whatsapp}
              </a>
            </li>
            <li>
              <a href={telHref()} className="hover:text-white">
                Call {business.phone}
              </a>
            </li>
            <li className="pt-2 text-xs text-white/45">
              M-Pesa Paybill {business.payments.paybill} · A/C {business.payments.accountNumber}
              {paybillName ? ` · ${paybillName}` : ""}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {business.brandName}. {business.domain}
      </div>
    </footer>
  );
}
