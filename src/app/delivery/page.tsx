import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";

export const metadata: Metadata = {
  title: "Delivery | Swift Mall",
  description:
    "Swift Mall delivers countrywide at a flat KES 250. We confirm your order by call or WhatsApp before dispatch.",
  robots: isTrustPageLive("delivery") ? { index: true, follow: true } : { index: false, follow: false },
};

export default function DeliveryPage() {
  const nairobi = confirmedValue(business.delivery.nairobi);
  const major = confirmedValue(business.delivery.majorTowns);
  const other = confirmedValue(business.delivery.otherAreas);
  const retry = confirmedValue(business.delivery.retryPolicy);
  const hasTimes = Boolean(nairobi && major && other);

  return (
    <TrustPageShell
      title="Delivery across Kenya."
      summary="Order, inspect, then pay. Delivered countrywide for KES 250."
    >
      <TrustSection title="Cost">
        <p>Delivery is a flat KES {business.shippingFlatKes} countrywide.</p>
      </TrustSection>

      <TrustSection title="Times">
        {hasTimes ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="py-2 font-semibold">Area</th>
                <th className="py-2 font-semibold">Delivery time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink/5">
                <td className="py-2">Nairobi</td>
                <td className="py-2">{nairobi}</td>
              </tr>
              <tr className="border-b border-ink/5">
                <td className="py-2">Major towns</td>
                <td className="py-2">{major}</td>
              </tr>
              <tr>
                <td className="py-2">Other areas</td>
                <td className="py-2">{other}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>We will tell you the delivery time when we confirm your order.</p>
        )}
      </TrustSection>

      <TrustSection title="Before we dispatch">
        <p>
          We call or WhatsApp you to confirm your order, your phone number and your delivery
          location.
        </p>
      </TrustSection>

      <TrustSection title="When your parcel arrives">
        <p>
          Check that the item matches your order before you pay or sign. If something is wrong,
          tell the rider and call us on {business.phone}.
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
