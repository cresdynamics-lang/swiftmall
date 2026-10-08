import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { OrderTawkNotify } from "@/components/checkout/OrderTawkNotify";
import { CreatePasswordForm } from "@/app/checkout/done/CreatePasswordForm";
import { getStoreSettings } from "@/lib/settings";
import { orderTawkAttributes, toNotifyPayload } from "@/lib/order-notify";
import { getOrderByNumberAndEmail } from "@/lib/orders";
import { storeConfig } from "@/lib/store-config";
import { prisma } from "@/lib/db";

type PageProps = {
  searchParams: Promise<{ order?: string; email?: string }>;
};

export default async function CheckoutDonePage({ searchParams }: PageProps) {
  const { order, email: emailParam } = await searchParams;
  const settings = await getStoreSettings();
  const orderNumber = order ? Number(order) : NaN;
  const email = (emailParam ?? "").trim().toLowerCase();

  const existing = email
    ? await prisma.customer.findUnique({ where: { email } })
    : null;
  const hasPassword = Boolean(existing?.passwordHash);

  const placed =
    Number.isFinite(orderNumber) && email
      ? await getOrderByNumberAndEmail(orderNumber, email)
      : null;

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
          Order submitted successfully
        </h1>
        {order ? (
          <p className="mt-2 font-display text-xl font-bold text-brand">#{order}</p>
        ) : null}
        <p className="mt-3 text-sm text-ink/65">
          We have your details and will confirm by email / WhatsApp (
          {settings.whatsappNumber}). For Pay now or deposit, use M-Pesa Paybill{" "}
          <strong>{settings.paybill}</strong> (account <strong>{settings.bankAccount}</strong>).
        </p>

        {email && Number.isFinite(orderNumber) && !hasPassword ? (
          <CreatePasswordForm email={email} orderNumber={orderNumber} />
        ) : (
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/account"
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              {hasPassword ? "Go to my account" : "Track my order"}
            </Link>
            <Link
              href="/"
              className="rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink"
            >
              Continue Browsing
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-ink/40">{storeConfig.domain}</p>
      </div>

      {placed ? (
        <OrderTawkNotify
          name={placed.customerName}
          email={placed.email}
          phone={placed.phone}
          attributes={orderTawkAttributes(toNotifyPayload(placed))}
        />
      ) : null}
    </div>
  );
}
