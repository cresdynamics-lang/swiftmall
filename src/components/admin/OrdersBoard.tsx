"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { OrderStatus } from "@prisma/client";
import { updateOrderNote, updateOrderStatus } from "@/app/management/actions";
import {
  statusTone,
  type AdminOrderView,
} from "@/lib/admin-orders-view";
import type { OrderFilter } from "@/lib/orders";
import { formatKes } from "@/lib/format";
import { whatsappHref } from "@/lib/store-config";

const filters: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "to_dispatch", label: "To dispatch" },
  { id: "part_paid", label: "Part-paid" },
  { id: "to_collect", label: "To collect" },
];

function matchesFilter(order: AdminOrderView, filter: OrderFilter) {
  switch (filter) {
    case "new":
      return order.status === "NEW";
    case "to_dispatch":
      return order.status === "NEW" || order.status === "CONFIRMED" || order.status === "PACKED";
    case "part_paid":
      return order.payment === "Deposit";
    case "to_collect":
      return order.payment === "Cash on delivery" || order.payment === "Pay on delivery";
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
                    <td className="px-3 py-3 font-semibold">#{o.number}</td>
                    <td className="px-3 py-3">{o.customer}</td>
                    <td className="px-3 py-3 text-ink/70">{o.county}</td>
                    <td className="px-3 py-3 text-ink/70">{o.payment}</td>
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
          <aside className="h-fit rounded-xl bg-white p-4 ring-1 ring-ink/8">
            <h2 className="font-display text-lg font-bold">Order #{selected.number}</h2>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone(selected.status)}`}
            >
              {selected.statusLabel}
            </span>

            <p className="mt-3 text-sm text-ink/75">
              {selected.customer} · {selected.phone}
              <br />
              {selected.email}
            </p>
            <p className="mt-2 text-sm text-ink/65">
              {selected.county}, {selected.town} · {selected.address}
              <br />
              Delivery note: {selected.carrier !== "—" ? selected.carrier : "Arrange after order"}
            </p>

            <ul className="mt-4 space-y-2 border-t border-ink/8 pt-3">
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

            <p className="mt-3 text-sm text-ink/55">
              Shipping {selected.shipping} · {selected.paymentNote}
            </p>
            <p className="mt-1 font-display text-xl font-bold">{formatKes(selected.total)}</p>

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setStatus(selected.id, OrderStatus.PACKED)}
                className="rounded-md bg-brand py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
              >
                Mark as packed
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-md bg-ink py-2.5 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Print slip
              </button>
              <a
                href={whatsappHref(
                  `Hi ${selected.customer}, this is Swiftmall about order #${selected.number}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#25D366] py-2.5 text-center text-sm font-semibold text-white hover:brightness-95"
              >
                WhatsApp customer
              </a>
              <div className="rounded-md border border-ink/10 p-2">
                <label className="block text-xs font-medium text-ink/55">Add note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded border-0 bg-transparent text-sm outline-none"
                  placeholder="Internal note…"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={saveNote}
                  className="mt-1 text-xs font-semibold text-ink underline"
                >
                  Save note
                </button>
              </div>
              {selected.status === "PACKED" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStatus(selected.id, OrderStatus.DISPATCHED)}
                  className="rounded-md border border-ink/15 py-2.5 text-sm font-semibold hover:bg-ink/5"
                >
                  Mark as dispatched
                </button>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
