import Link from "next/link";
import { notFound } from "next/navigation";
import {
  business,
  formatOrderNumber,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";
import { formatKes } from "@/lib/format";
import {
  getOrderByToken,
  orderStatusLabel,
  paymentMethodLabel,
  paymentNote,
} from "@/lib/orders";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Track order",
};

type PageProps = { params: Promise<{ token: string }> };

function maskPhone(phone: string) {
  if (phone.length < 6) return "••••";
  return `${phone.slice(0, 4)}•••${phone.slice(-2)}`;
}

export default async function TrackTokenPage({ params }: PageProps) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  const events = order.events?.length
    ? order.events
    : [{ status: order.status, note: "", createdAt: order.createdAt, actor: "system" }];

  const balanceDue =
    order.paymentState === "PART_PAID" || order.paymentState === "TO_COLLECT"
      ? order.total - order.amountConfirmed
      : 0;

  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Order status</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-ink">
        {formatOrderNumber(order.number)}
      </h1>
      <p className="mt-1 text-sm text-ink/55">
        {order.customerName.split(/\s+/)[0]} · {maskPhone(order.phone)}
      </p>
      <p className="mt-3 rounded-lg bg-brand/20 px-3 py-2 text-sm font-semibold text-ink">
        {orderStatusLabel[order.status]}
      </p>

      <ol className="mt-6 space-y-3 rounded-xl bg-white p-5 text-sm ring-1 ring-ink/8">
        {events.map((ev, i) => (
          <li key={`${ev.status}-${i}`} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold">
              {i + 1}
            </span>
            <span>
              <span className="font-semibold">{orderStatusLabel[ev.status]}</span>
              <span className="mt-0.5 block text-xs text-ink/50">
                {new Date(ev.createdAt).toLocaleString("en-KE", {
                  timeZone: "Africa/Nairobi",
                })}
                {ev.note ? ` · ${ev.note}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 space-y-2 rounded-xl bg-white p-5 text-sm ring-1 ring-ink/8">
        <p>
          <strong>Payment:</strong> {paymentMethodLabel[order.paymentMethod]} ·{" "}
          {paymentNote(order)}
        </p>
        {balanceDue > 0 ? (
          <p>
            <strong>Balance due:</strong> {formatKes(balanceDue)}
          </p>
        ) : null}
        <ul className="mt-2 space-y-1 border-t border-ink/10 pt-2">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span>
                {i.name}
                {i.size ? ` (${i.size})` : ""} × {i.qty}
              </span>
              <span>{formatKes(i.unitPrice * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between pt-2 font-semibold">
          <span>Total</span>
          <span>{formatKes(order.total)}</span>
        </p>
        {order.fulfilment === "PICKUP" ? (
          <p className="pt-2 text-xs text-ink/60">
            Pickup: {shopAddressDisplay()}. Hours: {shopHoursDisplay()}.{" "}
            {business.pickup.collectHint}
          </p>
        ) : (
          <p className="pt-2 text-xs text-ink/60">Delivery to your confirmed address.</p>
        )}
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href={`/order/${order.trackingToken}/invoice`} className="font-semibold underline">
          Print invoice
        </Link>
      </p>
    </div>
  );
}
