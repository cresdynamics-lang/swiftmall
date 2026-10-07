import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { storeConfig } from "@/lib/store-config";

export default function CheckoutDonePage() {
  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-3xl px-4 py-3">
          <Logo />
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm font-medium text-ink/50">
          1 Cart › 2 Checkout › <span className="text-ink">3 Done</span>
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Order placed</h1>
        <p className="mt-3 text-sm text-ink/65">
          We’ll confirm by email / WhatsApp. For Pay on order, send payment to bank account{" "}
          <strong>{storeConfig.payments.bankAccount}</strong>
          {storeConfig.payments.paybill
            ? ` or Paybill ${storeConfig.payments.paybill}`
            : " (Paybill coming soon)"}
          .
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/track"
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Track my order
          </Link>
          <Link
            href="/"
            className="rounded-md border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
