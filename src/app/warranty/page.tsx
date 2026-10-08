import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";

/** Unlinked / noindex until warranty periods are confirmed. */
export const metadata: Metadata = {
  title: "Warranty | Swift Mall",
  description: "Warranty information for electronics, phones and kitchen appliances at Swift Mall.",
  robots: isTrustPageLive("warranty")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function WarrantyPage() {
  const electronics = confirmedValue(business.warranty.electronics);
  const phones = confirmedValue(business.warranty.phones);
  const kitchen = confirmedValue(business.warranty.kitchen);
  const any = electronics || phones || kitchen;

  return (
    <TrustPageShell
      title="Warranty"
      summary="Cover for electronics, phones and kitchen appliances — only where confirmed."
    >
      {any ? (
        <TrustSection title="Warranty periods">
          <ul className="list-disc space-y-1 pl-5">
            {electronics ? <li>Electronics: {electronics}</li> : null}
            {phones ? <li>Phones: {phones}</li> : null}
            {kitchen ? <li>Kitchen appliances: {kitchen}</li> : null}
          </ul>
        </TrustSection>
      ) : (
        <TrustSection title="Before we publish warranty terms">
          <p>
            We have not published warranty periods yet. For electronics, phones and kitchen
            appliances, ask us on WhatsApp {business.whatsapp} before you buy if you need warranty
            details. We will not invent a period.
          </p>
        </TrustSection>
      )}
      <TrustSection title="How to claim">
        <p>
          WhatsApp {business.whatsapp} with your order number, the product name and a short
          description of the fault. We will tell you the next step.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
