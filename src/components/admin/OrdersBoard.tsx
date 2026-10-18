"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import {
  confirmOrderPayment,
  recordCashCollected,
  saveRiderDetails,
  updateOrderNote,
  updateOrderStatus,
} from "@/app/management/actions";
import {
  statusTone,
  type AdminOrderView,
} from "@/lib/admin-orders-view";
import { formatOrderNumber, type OrderFilter } from "@/lib/orders";
import { formatKes } from "@/lib/format";
import { whatsappHref } from "@/lib/store-config";

const filters: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "Awaiting call" },
  { id: "awaiting_mpesa", label: "M-Pesa codes" },
  { id: "to_dispatch", label: "To dispatch" },
  { id: "pickup_ready", label: "Pickup ready" },
  { id: "part_paid", label: "Deposit" },
  { id: "to_collect", label: "To collect" },
];

function matchesFilter(order: AdminOrderView, filter: OrderFilter) {
  switch (filter) {
    case "new":
    case "awaiting_call":
      return order.status === "NEW";
    case "awaiting_mpesa":
      return order.paymentState === "AWAITING_MPESA";
    case "to_dispatch":
      return (
        order.fulfilment === "DELIVERY" &&
        (order.status === "NEW" ||
          order.status === "CONFIRMED" ||
          order.status === "PACKED")
      );
    case "pickup_ready":
      return order.status === "READY_FOR_PICKUP";
    case "part_paid":
      return order.paymentState === "PART_PAID";
    case "to_collect":
      return order.paymentState === "TO_COLLECT";
    default:
      return true;
  }
}

export function OrdersBoard({
  orders: initialOrders,
  stats,
}: {
  orders: AdminOrderView[];
  stats: {
    ordersToday: number;
    salesToday: number;
    toDispatch: number;
    lowStock: number;
    awaitingMpesa?: number;
    newOrders?: number;
  };
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [selectedId, setSelectedId] = useState(initialOrders[0]?.id ?? "");
  const [note, setNote] = useState(initialOrders[0]?.note ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
    setSelectedId((prev) =>
      initialOrders.some((o) => o.id === prev) ? prev : (initialOrders[0]?.id ?? ""),
    );
  }, [initialOrders]);

  const visible = useMemo(
    () => orders.filter((o) => matchesFilter(o, filter)),
    [orders, filter],
  );
  const selected = orders.find((o) => o.id === selectedId) ?? visible[0] ?? null;

  function setStatus(id: string, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              statusLabel:
                status === "NEW"
                  ? "New"
                  : status === "PACKED"
                    ? "Packed"
                    : status === "DISPATCHED"
                      ? "Dispatched"
                      : status === "DELIVERED"
                        ? "Delivered"
                        : status === "CONFIRMED"
                          ? "Confirmed"
                          : o.statusLabel,
            }
          : o,
      ),
    );
    startTransition(async () => {
      await updateOrderStatus(id, status);
    });
  }

  function saveNote() {
    if (!selected) return;
    startTransition(async () => {
      await updateOrderNote(selected.id, note);
      setOrders((prev) =>
        prev.map((o) => (o.id === selected.id ? { ...o, note } : o)),
      );
    });
  }

  const newCount = orders.filter((o) => o.status === "NEW").length;

  return (
    <div className="space-y-5">
      {newCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand/25 px-4 py-3 ring-1 ring-brand/40">
          <p className="text-sm font-semibold text-ink">
            {newCount} new order{newCount === 1 ? "" : "s"} waiting
          </p>
          <button
            type="button"
            onClick={() => setFilter("new")}
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink/90"
          >
            Show new
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 font-display text-2xl font-bold">Orders</h1>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === f.id
                ? "bg-ink text-white"
                : "bg-white text-ink/70 ring-1 ring-ink/10 hover:bg-ink/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Orders today", value: String(stats.ordersToday) },
          { label: "Sales today", value: formatKes(stats.salesToday) },
          { label: "To dispatch", value: String(stats.toDispatch) },
          { label: "Low stock", value: String(stats.lowStock) },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-white p-4 ring-1 ring-ink/8">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
              {tile.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink/8">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-[11px] uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">County</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const active = selected?.id === o.id;
                return (
                  <tr
                    key={o.id}
                    onClick={() => {
                      setSelectedId(o.id);
                      setNote(o.note);
                    }}
                    className={`cursor-pointer border-b border-ink/5 ${
                      active ? "bg-brand/20" : "hover:bg-ink/[0.03]"
                    }`}
                  >
                    <td className="px-3 py-3 font-semibold">
                      {formatOrderNumber(o.number)}
                      <span className="mt-0.5 block text-[10px] font-normal text-ink/45">
                        {o.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}
                      </span>
                    </td>
                    <td className="px-3 py-3">{o.customer}</td>
                    <td className="px-3 py-3 text-ink/70">
                      {o.fulfilment === "PICKUP" ? "Shop" : o.county}
                    </td>
                    <td className="px-3 py-3 text-ink/70">
                      {o.payment}
                      {o.mpesaCode ? (
                        <span className="mt-0.5 block text-[10px] text-amber-700">
                          Code: {o.mpesaCode}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 font-semibold">
                      {o.total.toLocaleString("en-KE")}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone(o.status)}`}
                      >
                        {o.statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-ink/45">
                    No orders in this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {selected ? (
          <aside className="h-fit space-y-3 rounded-xl bg-white p-4 ring-1 ring-ink/8">
            <div>
              <h2 className="font-display text-lg font-bold">
                {formatOrderNumber(selected.number)}
              </h2>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone(selected.status)}`}
              >
                {selected.statusLabel}
              </span>
            </div>

            <p className="text-sm text-ink/75">
              {selected.customer} · {selected.phone}
              <br />
              {selected.email || "(no email)"}
            </p>
            <p className="text-sm text-ink/65">
              {selected.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}
              {selected.zone ? ` · ${selected.zone}` : ""}
              <br />
              {selected.address}
            </p>

            <div className="rounded-lg bg-ink/[0.03] p-3 text-sm">
              <p className="font-semibold">Payment panel</p>
              <p className="mt-1 text-ink/70">{selected.paymentNote}</p>
              {selected.mpesaCode ? (
                <p className="mt-1 text-amber-800">
                  Customer M-Pesa code (claim): <strong>{selected.mpesaCode}</strong>
                </p>
              ) : null}
              {selected.amountExpected > 0 ? (
                <p className="mt-1 text-xs text-ink/55">
                  Expected: {formatKes(selected.amountExpected)}
                </p>
              ) : null}
              {selected.paymentState === "AWAITING_MPESA" ||
              selected.paymentState === "PART_PAID" ? (
                <button
                  type="button"
                  disabled={pending}
                  className="mt-2 w-full rounded-md bg-brand py-2 text-xs font-semibold"
                  onClick={() =>
                    startTransition(async () => {
                      const amt = window.prompt(
                        "Amount received (KES)",
                        String(selected.amountExpected || selected.total),
                      );
                      if (!amt) return;
                      await confirmOrderPayment(selected.id, Number(amt));
                    })
                  }
                >
                  Confirm payment
                </button>
              ) : null}
              {selected.paymentState === "TO_COLLECT" ? (
                <button
                  type="button"
                  disabled={pending}
                  className="mt-2 w-full rounded-md bg-brand py-2 text-xs font-semibold"
                  onClick={() =>
                    startTransition(async () => {
                      const amt = window.prompt(
                        "Cash collected (KES)",
                        String(selected.total),
                      );
                      if (!amt) return;
                      await recordCashCollected(selected.id, Number(amt));
                    })
                  }
                >
                  Record cash collected
                </button>
              ) : null}
            </div>

            <ul className="space-y-2 border-t border-ink/8 pt-3">
              {selected.items.map((item) => (
                <li key={`${item.name}-${item.qty}`} className="flex items-center gap-3 text-sm">
                  <div className="relative h-10 w-10 overflow-hidden rounded bg-ink/[0.04]">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {item.name} × {item.qty}
                      {item.size ? ` · ${item.size}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold">{item.price.toLocaleString("en-KE")}</p>
                </li>
              ))}
            </ul>

            <p className="text-sm text-ink/55">
              {selected.fulfilment === "PICKUP" ? "Pickup" : "Shipping"}{" "}
              {formatKes(selected.shipping)}
            </p>
            <p className="font-display text-xl font-bold">{formatKes(selected.total)}</p>

            <div className="grid gap-2">
              {selected.status === "NEW" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.CONFIRMED)}
                  className="rounded-md bg-brand py-2.5 text-sm font-semibold"
                >
                  Confirm (after call)
                </button>
              ) : null}
              {selected.status === "CONFIRMED" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.PACKED)}
                  className="rounded-md bg-brand py-2.5 text-sm font-semibold"
                >
                  Mark preparing / packed
                </button>
              ) : null}
              {selected.status === "PACKED" && selected.fulfilment === "DELIVERY" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.DISPATCHED)}
                  className="rounded-md border border-ink/15 py-2.5 text-sm font-semibold"
                >
                  Mark dispatched
                </button>
              ) : null}
              {selected.status === "PACKED" && selected.fulfilment === "PICKUP" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.READY_FOR_PICKUP)}
                  className="rounded-md border border-ink/15 py-2.5 text-sm font-semibold"
                >
                  Ready for pickup
                </button>
              ) : null}
              {selected.status === "DISPATCHED" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.DELIVERED)}
                  className="rounded-md bg-ink py-2.5 text-sm font-semibold text-white"
                >
                  Mark delivered
                </button>
              ) : null}
              {selected.status === "READY_FOR_PICKUP" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.COLLECTED)}
                  className="rounded-md bg-ink py-2.5 text-sm font-semibold text-white"
                >
                  Mark collected
                </button>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const name = window.prompt("Rider name (optional)", selected.riderName) ?? "";
                    const phone =
                      window.prompt("Rider phone (optional)", selected.riderPhone) ?? "";
                    await saveRiderDetails(selected.id, name, phone);
                  })
                }
                className="rounded-md border border-ink/15 py-2 text-xs font-semibold"
              >
                Rider details
              </button>
              <a
                href={`/order/${selected.trackingToken}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-ink py-2.5 text-center text-sm font-semibold text-white"
              >
                Print invoice
              </a>
              <a
                href={whatsappHref(
                  `Hi ${selected.customer}, this is Swift Mall about order ${formatOrderNumber(selected.number)}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#25D366] py-2.5 text-center text-sm font-semibold text-white"
              >
                WhatsApp customer
              </a>
              <div className="rounded-md border border-ink/10 p-2">
                <label className="block text-xs font-medium text-ink/55">Internal note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded border-0 bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={saveNote}
                  className="mt-1 text-xs font-semibold underline"
                >
                  Save note
                </button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
