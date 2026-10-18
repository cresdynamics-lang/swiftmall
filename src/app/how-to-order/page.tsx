import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import {
  business,
  isTrustPageLive,
  pickupReadyDisplay,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "How to order | Swift Mall",
  description: `Order from Swift Mall in three steps. Pay on delivery, pay now with M-Pesa, or pay a deposit. Delivery or pickup. Flat KES ${business.shippingFlatKes} delivery.`,
  robots: isTrustPageLive("howToOrder")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function HowToOrderPage() {
  return (
    <TrustPageShell
      title="Ordering from Swift Mall takes three steps."
      summary={`Order, inspect, then pay. Delivered countrywide for KES ${business.shippingFlatKes}.`}
    >
      <TrustSection title="Step 1 — Pick your item">
        <p>
          Choose the product, then size or colour if asked, and tap Add to Cart or Buy Now.
        </p>
      </TrustSection>

      <TrustSection title="Step 2 — Delivery or pickup">
        <p>
          Enter your name and Kenyan phone. Email is optional but encouraged for your confirmation
          and tracking link. No account needed.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Delivery:</strong> county, town or area, street and building, landmark. Fee KES{" "}
            {business.shippingFlatKes}. Nairobi: {business.deliveryZones.nairobi.promise} Outside
            Nairobi: {business.deliveryZones.upcountry.promise}
          </li>
          <li>
            <strong>Pickup:</strong> {shopAddressDisplay()}. Hours: {shopHoursDisplay()}.{" "}
            {pickupReadyDisplay() ? `${pickupReadyDisplay()} ` : null}
            {business.pickup.collectHint} Fee KES {business.pickup.feeKes}.
          </li>
        </ul>
      </TrustSection>

      <TrustSection title="Step 3 — Choose how to pay">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Delivery: pay on delivery (inspect, then pay); pay now with M-Pesa (full amount); or pay
            a deposit of exactly {Math.round(business.payments.depositShare * 100)}% now with the
            balance on delivery.
          </li>
          <li>
            Pickup: pay when you collect (inspect, then pay) or pay now with M-Pesa. No deposit for
            pickup.
          </li>
        </ul>
      </TrustSection>

      <TrustSection title="What happens next">
        <p>
          Every order is confirmed by a real person by call or WhatsApp before dispatch. We send
          tracking updates when the status changes.
        </p>
      </TrustSection>

      <TrustSection title="Pay with M-Pesa">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Open M-Pesa → Lipa na M-Pesa → Pay Bill.</li>
          <li>Business number: {business.payments.paybill}</li>
          <li>Account number: {business.payments.accountNumber}</li>
          <li>Enter the amount and your M-Pesa PIN.</li>
        </ol>
        <p className="mt-2">
          Confirm the business name on your M-Pesa screen before you finish. If it does not look
          right, stop and call {business.phone}. {business.brandName} will never ask for your
          M-Pesa PIN.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
