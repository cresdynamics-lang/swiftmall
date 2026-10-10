import type { Metadata } from "next";
import Link from "next/link";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";
import { whatsappHref } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Return Policy | Swift Mall",
  description:
    "Swift Mall return policy: how to complain within 5 days, return approval, exchange or refund, correctly delivered items, and items that cannot be returned.",
  robots: isTrustPageLive("returns")
    ? { index: true, follow: true }
    : { index: false, follow: false },
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  const days = confirmedValue(business.returns.reportWithinDays) ?? 5;
  const fee = confirmedValue(business.returns.processingFeePercent) ?? 10;
  const nonReturnable = confirmedValue(business.returns.nonReturnable) ?? [];
  const returnsEmail = business.returnsEmail;

  return (
    <TrustPageShell
      title="Return policy"
      summary="How complaints, returns, exchanges and refunds work at Swiftmall."
    >
      <TrustSection title="Return instructions">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            Send a complaint within <strong>{days} days</strong> of delivery. Include pictures of
            the product that was delivered. Contact us on WhatsApp{" "}
            <a
              href={whatsappHref(
                "Hi Swift Mall, I need help with a return. Order number: ",
              )}
              className="font-semibold underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {business.whatsapp}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${returnsEmail}`} className="font-semibold underline">
              {returnsEmail}
            </a>
            .
          </li>
          <li>
            <strong>Return approval.</strong> Once your claim is validated, we will arrange for
            return collection.
          </li>
          <li>
            <strong>Exchange / refund.</strong> Once the returned item is received, we will either
            refund or exchange the item according to your preference.
          </li>
        </ol>
      </TrustSection>

      <TrustSection title="Correctly delivered items">
        <p>An order is considered correctly delivered where:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>The item matches the product description on the platform</li>
          <li>The item matches the images and specifications on the website</li>
          <li>The item is free from defects, damages, or functional issues</li>
        </ul>
        <p className="mt-3">
          Correctly delivered items are generally not eligible for return because the order was
          fulfilled accurately. If you still wish to return such an item, Swiftmall may accept the
          return under these conditions:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>{fee}% of the item value</strong> will be charged as an order processing fee to
            cover Swiftmall&apos;s handling, management, packaging, and return logistics
          </li>
          <li>
            Refunds are processed only after the returned item has been inspected and confirmed to
            be in its original pristine condition
          </li>
          <li>
            Shipping and delivery fees are non-refundable for returns involving a change of mind, or
            any scenario where the item was correctly delivered
          </li>
        </ul>
      </TrustSection>

      <TrustSection title="Cancellation by customer (change of mind)">
        <p>
          Orders cancelled by the customer for reasons not attributable to Swiftmall (including
          change of mind, incorrect selection, or preference-based reasons) will incur a{" "}
          <strong>{fee}% order processing fee</strong>. This fee offsets costs associated with
          processing the order and is deducted from the refunded amount.
        </p>
        <p className="mt-2">
          This does not apply to cancellations arising from product defects, delivery errors, or
          other circumstances for which Swiftmall is responsible.
        </p>
      </TrustSection>

      <TrustSection title="Return conditions">
        <p>To be eligible for a return, the item must:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Be unused, undamaged, and in resellable condition</li>
          <li>Include all original packaging, accessories, manuals, and tags</li>
          <li>Be returned within the applicable return window</li>
        </ul>
        <p className="mt-2">
          Items that show signs of use, damage, or tampering will not qualify for a refund.
        </p>
      </TrustSection>

      {nonReturnable.length > 0 ? (
        <TrustSection title="Items not eligible for returns">
          <ul className="list-disc space-y-1 pl-5">
            {nonReturnable.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </TrustSection>
      ) : null}

      <TrustSection title="How to start">
        <p>
          WhatsApp{" "}
          <a
            href={whatsappHref("Hi Swift Mall, I need help with a return.")}
            className="font-semibold underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {business.whatsapp}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${returnsEmail}`} className="font-semibold underline">
            {returnsEmail}
          </a>
          . Send your order number, photos of what you received, and a short description of the
          issue.
        </p>
        <p className="mt-2">
          Also see{" "}
          <Link href="/delivery" className="font-semibold underline">
            Delivery
          </Link>{" "}
          and{" "}
          <Link href="/payments" className="font-semibold underline">
            Payments
          </Link>
          .
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
