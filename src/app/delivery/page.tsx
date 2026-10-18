import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import {
  business,
  confirmedValue,
  isTrustPageLive,
  pickupReadyDisplay,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Delivery | Swift Mall",
  description: `Swift Mall delivers countrywide at a flat KES ${business.shippingFlatKes}. Pickup available at our Nairobi shop. We confirm every order by call or WhatsApp before dispatch.`,
  robots: isTrustPageLive("delivery")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function DeliveryPage() {
  const retry = confirmedValue(business.delivery.retryPolicy);
  const mapUrl = confirmedValue(business.shop.mapUrl);
  const pickupReady = pickupReadyDisplay();

  return (
    <TrustPageShell
      title="Delivery across Kenya."
      summary={`Order, inspect, then pay. Delivered countrywide for KES ${business.shippingFlatKes}.`}
    >
      <TrustSection title="Cost">
        <p>Delivery is a flat KES {business.shippingFlatKes} countrywide.</p>
      </TrustSection>

      <TrustSection title="Times">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10">
              <th className="py-2 font-semibold">Area</th>
              <th className="py-2 font-semibold">Delivery time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink/5">
              <td className="py-2">{business.deliveryZones.nairobi.label}</td>
              <td className="py-2">{business.deliveryZones.nairobi.promise}</td>
            </tr>
            <tr>
              <td className="py-2">{business.deliveryZones.upcountry.label}</td>
              <td className="py-2">{business.deliveryZones.upcountry.promise}</td>
            </tr>
          </tbody>
        </table>
      </TrustSection>

      <TrustSection title="Pickup at the shop">
        <p>{shopAddressDisplay()}</p>
        <p className="mt-1">Hours: {shopHoursDisplay()}</p>
        {pickupReady ? <p className="mt-1">{pickupReady}</p> : null}
        <p className="mt-1">{business.pickup.collectHint}</p>
        <p className="mt-1 text-sm text-ink/70">{business.pickup.afterHoursNote}</p>
        <p className="mt-1">Pickup fee KES {business.pickup.feeKes}.</p>
        {mapUrl ? (
          <p className="mt-2">
            <a href={mapUrl} className="font-semibold underline" target="_blank" rel="noopener noreferrer">
              Open in Maps
            </a>
          </p>
        ) : null}
      </TrustSection>

      <TrustSection title="Before we dispatch">
        <p>
          Every order is confirmed by a real person by call or WhatsApp before dispatch. We confirm
          your order, your phone number and your delivery or pickup details.
        </p>
      </TrustSection>

      <TrustSection title="When your parcel arrives">
        <p>
          Check that the item matches your order before you pay or sign. If something is wrong, tell
          the rider and call us on {business.phone}.
        </p>
      </TrustSection>

      <TrustSection title="Can't be reached?">
        {retry ? (
          <p>{retry}</p>
        ) : (
          <p>
            If we cannot reach you on delivery day, please call or WhatsApp us on {business.phone}{" "}
            so we can arrange another attempt. Keep your phone on.
          </p>
        )}
      </TrustSection>

      <TrustSection title="Track your order">
        <p>
          <Link href="/track" className="font-semibold text-ink underline">
            Track my order
          </Link>
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
