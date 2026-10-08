import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";

/** Unlinked / noindex until return window and non-returnable list are confirmed. */
export const metadata: Metadata = {
  title: "Returns | Swift Mall",
  description: "How returns and refunds work at Swift Mall, in plain words.",
  robots: isTrustPageLive("returns")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function ReturnsPage() {
  const hours = confirmedValue(business.returns.reportWithinHours);
  const nonReturnable = confirmedValue(business.returns.nonReturnable);
  const refundMethod = confirmedValue(business.returns.refundMethod);
  const refundDays = confirmedValue(business.returns.refundDays);
  const changeOfMind = business.returns.changeOfMind.confirmed
    ? business.returns.changeOfMind.value
    : null;

  return (
    <TrustPageShell
      title="Returns, swaps and refunds, in plain words."
      summary="Tell us quickly if something arrives wrong, damaged or faulty."
    >
      <TrustSection title="If something is wrong">
        {hours != null ? (
          <p>
            If your item arrives wrong, damaged or faulty, tell us within {hours} hours of
            receiving it. Send us a photo on WhatsApp {business.whatsapp}. We will swap it or
            refund you, as you prefer.
          </p>
        ) : (
          <p>
            If your item arrives wrong, damaged or faulty, WhatsApp us on {business.whatsapp} with
            your order number and a photo. We will tell you the next step.
          </p>
        )}
      </TrustSection>

      {nonReturnable && nonReturnable.length > 0 ? (
        <TrustSection title="What we cannot take back">
          <ul className="list-disc space-y-1 pl-5">
            {nonReturnable.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </TrustSection>
      ) : null}

      {changeOfMind === false ? (
        <TrustSection title="Change of mind">
          <p>We do not accept returns for change of mind.</p>
        </TrustSection>
      ) : null}

      {refundMethod || refundDays != null ? (
        <TrustSection title="How refunds are paid">
          <p>
            {refundMethod ? `${refundMethod}. ` : null}
            {refundDays != null ? `Allow about ${refundDays} days.` : null}
          </p>
        </TrustSection>
      ) : null}

      <TrustSection title="How to start a return">
        <p>
          WhatsApp {business.whatsapp}. Send your order number, a photo and a short description of
          the problem. We will reply with the next step.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
