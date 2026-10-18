import Link from "next/link";
import { MetaPurchase } from "@/components/analytics/MetaPurchase";
import { Logo } from "@/components/layout/Logo";
import { OrderTawkNotify } from "@/components/checkout/OrderTawkNotify";
import { CreatePasswordForm } from "@/app/checkout/done/CreatePasswordForm";
import {
  business,
  formatOrderNumber,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";
import { formatKes } from "@/lib/format";
import { orderTawkAttributes, toNotifyPayload } from "@/lib/order-notify";
import { getOrderByToken, paymentMethodLabel, paymentNote } from "@/lib/orders";
import { whatsappHref } from "@/lib/store-config";
import { prisma } from "@/lib/db";

export const metadata = {
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ order?: string; email?: string; token?: string }>;
};

export default async function CheckoutDonePage({ searchParams }: PageProps) {
  const { order, email: emailParam, token } = await searchParams;
  const email = (emailParam ?? "").trim().toLowerCase();
  const placed = token ? await getOrderByToken(token) : null;

  const existing = email
    ? await prisma.customer.findUnique({ where: { email } })
    : null;
  const hasPassword = Boolean(existing?.passwordHash);
  const orderNumber = placed?.number ?? (order ? Number(order) : NaN);

  const wa = placed
    ? whatsappHref(
        `Hi Swift Mall, my order is ${formatOrderNumber(placed.number)}.`,
      )
    : whatsappHref();

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-3xl px-4 py-3">
          <Logo />
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-sm font-medium text-ink/50">
          Checkout › <span className="text-ink">Done</span>
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">
          {placed
            ? `Thank you, ${placed.customerName.split(/\s+/)[0]}. We have your order.`
            : "Thank you. We have your order."}
        </h1>
        {Number.isFinite(orderNumber) ? (
          <p className="mt-2 font-display text-xl font-bold text-brand">
            {formatOrderNumber(orderNumber)}
          </p>
        ) : null}

        {placed ? (
          <div className="mt-4 space-y-2 text-left text-sm text-ink/70">
            <p>
              <strong>Payment:</strong> {paymentMethodLabel[placed.paymentMethod]} ·{" "}
              {paymentNote(placed)}
            </p>
            {placed.paymentMethod === "PAY_ON_ORDER" ||
            placed.paymentMethod === "DEPOSIT" ? (
              <p>
                Pay now (M-Pesa): Lipa na M-Pesa, Paybill {business.payments.paybill}, Account{" "}
                {business.payments.accountNumber}, Amount:{" "}
                {formatKes(placed.amountExpected || placed.total)}. We confirm payment in admin —
                a code you enter is a claim only.
              </p>
            ) : null}
            {placed.fulfilment === "PICKUP" ? (
              <p>
                <strong>Pickup:</strong> {shopAddressDisplay()}. Hours: {shopHoursDisplay()}.{" "}
                {business.pickup.collectHint}
              </p>
            ) : (
              <p>
                <strong>Delivery:</strong> {placed.address}. We call or WhatsApp before dispatch.
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/65">
            We will call or WhatsApp you to confirm before dispatch.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {placed ? (
            <Link
              href={`/track/${placed.trackingToken}`}
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Track your order
            </Link>
          ) : (
            <Link
              href="/track"
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Track my order
            </Link>
          )}
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
          >
            WhatsApp us
          </a>
        </div>

        {email && Number.isFinite(orderNumber) && !hasPassword ? (
          <CreatePasswordForm email={email} orderNumber={orderNumber} />
        ) : (
          <div className="mt-8">
            <Link href="/" className="text-sm font-semibold underline">
              Continue browsing
            </Link>
          </div>
        )}

        {placed ? (
          <>
            <MetaPurchase
              orderId={String(placed.number)}
              value={placed.total}
              items={placed.items.map((i) => ({
                productId: i.productId ?? i.id,
                name: i.name,
                qty: i.qty,
                unitPrice: i.unitPrice,
                size: i.size ?? undefined,
              }))}
            />
            <OrderTawkNotify
              name={placed.customerName}
              email={placed.email || business.email}
              phone={placed.phone}
              attributes={orderTawkAttributes(toNotifyPayload(placed))}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
