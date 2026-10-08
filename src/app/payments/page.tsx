import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";

export const metadata: Metadata = {
  title: "Payment options | Swift Mall",
  description:
    "Pay on delivery, pay now with M-Pesa Paybill 880100, or pay a deposit. Swift Mall never asks for your M-Pesa PIN.",
  robots: isTrustPageLive("payments") ? { index: true, follow: true } : { index: false, follow: false },
};

export default function PaymentsPage() {
  const paybillName = confirmedValue(business.payments.paybillDisplayName);
  const depositRefundable = business.payments.depositRefundable.confirmed
    ? business.payments.depositRefundable.value
    : null;

  return (
    <TrustPageShell
      title="Pay the way you like."
      summary="Order, inspect, then pay. Delivered countrywide for KES 250."
    >
      <TrustSection title="Pay on delivery">
        <p>
          Choose pay on delivery at checkout. When the rider arrives, check that the item matches
          your order, then pay. You see the item before you pay.
        </p>
      </TrustSection>

      <TrustSection title="Pay now with M-Pesa">
        <ol className="list-decimal space-y-1 pl-5">
          <li>M-Pesa → Lipa na M-Pesa → Pay Bill</li>
          <li>Business number: {business.payments.paybill}</li>
          <li>Account: {business.payments.accountNumber}</li>
          <li>Enter the amount shown at checkout, then your PIN</li>
        </ol>
        {paybillName ? (
          <p className="mt-2">
            The confirmation screen should show: <strong>{paybillName}</strong>.
          </p>
        ) : (
          <p className="mt-2">
            Confirm the business name on your M-Pesa screen before you finish. If it does not look
            right, stop and call {business.phone}.
          </p>
        )}
      </TrustSection>

      <TrustSection title="Pay a deposit">
        <p>
          Pay about {Math.round(business.payments.depositShare * 100)}% now via M-Pesa Paybill{" "}
          {business.payments.paybill} (account {business.payments.accountNumber}). The balance is due
          on delivery.
        </p>
        {depositRefundable != null ? (
          <p>
            {depositRefundable
              ? "Deposits may be refunded under our returns rules."
              : "Ask us on WhatsApp before you pay if you need to know whether a deposit can be refunded."}
          </p>
        ) : (
          <p>
            Ask us on WhatsApp before you pay a deposit if you need to know whether it can be
            refunded.
          </p>
        )}
      </TrustSection>

      <TrustSection title="Staying safe">
        <p>
          Swift Mall will never ask for your M-Pesa PIN. We will only ever ask you to pay to
          Paybill {business.payments.paybill} or on delivery. If anyone asks for money to another
          number, call us on {business.phone}.
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
