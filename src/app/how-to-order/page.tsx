import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, isTrustPageLive } from "@/lib/business";

export const metadata: Metadata = {
  title: "How to order | Swift Mall",
  description:
    "Order from Swift Mall in three steps. Pay on delivery, pay now with M-Pesa, or pay a deposit. Countrywide delivery at a flat KES 250.",
  robots: isTrustPageLive("howToOrder") ? { index: true, follow: true } : { index: false, follow: false },
};

export default function HowToOrderPage() {
  const paybillName = business.payments.paybillDisplayName.confirmed
    ? business.payments.paybillDisplayName.value
    : null;

  return (
    <TrustPageShell
      title="Ordering from Swift Mall takes three steps."
      summary="Order, inspect, then pay. Delivered countrywide for KES 250."
    >
      <TrustSection title="Step 1 — Pick your item">
        <p>
          Choose the product, then size or colour if asked, and tap Add to Cart or Buy Now.
        </p>
      </TrustSection>

      <TrustSection title="Step 2 — Tell us where to deliver">
        <p>
          Enter your name, phone number and delivery area. You do not need an account.
        </p>
      </TrustSection>

      <TrustSection title="Step 3 — Choose how to pay">
        <ul className="list-disc space-y-1 pl-5">
          <li>Pay on delivery — see the item, then pay the rider.</li>
          <li>Pay now with M-Pesa — pay the full amount before we dispatch.</li>
          <li>Pay a deposit — pay a share now via M-Pesa, balance on delivery.</li>
        </ul>
      </TrustSection>

      <TrustSection title="What happens next">
        <p>
          We call or WhatsApp you to confirm the order. We send you dispatch details when the
          parcel is on the way. You pay on delivery if you chose that option.
        </p>
      </TrustSection>

      <TrustSection title="Pay with M-Pesa">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open M-Pesa → Lipa na M-Pesa → Pay Bill.</li>
          <li>Business number: {business.payments.paybill}</li>
          <li>Account number: {business.payments.accountNumber}</li>
          <li>Enter the amount and your M-Pesa PIN.</li>
        </ol>
        {paybillName ? (
          <p className="mt-2">
            On the confirmation screen you should see: <strong>{paybillName}</strong>.
          </p>
        ) : (
          <p className="mt-2">
            Check that the Paybill business name on your M-Pesa screen matches Swift Mall before
            you finish. If anything looks wrong, stop and call us on {business.phone}.
          </p>
        )}
      </TrustSection>

      <p>
        More answers in the{" "}
        <Link href="/faq" className="font-semibold text-ink underline">
          FAQ
        </Link>
        .
      </p>
    </TrustPageShell>
  );
}
