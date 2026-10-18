import type { OrderStatus } from "@prisma/client";
import {
  orderStatusLabel,
  paymentMethodLabel,
  paymentNote,
  type OrderWithItems,
} from "@/lib/orders";

export function statusTone(status: OrderStatus): string {
  switch (status) {
    case "NEW":
      return "bg-brand text-ink";
    case "CONFIRMED":
      return "bg-brand/40 text-ink";
    case "PACKED":
      return "bg-ink/10 text-ink";
    case "DISPATCHED":
    case "READY_FOR_PICKUP":
      return "bg-emerald-100 text-emerald-800";
    case "DELIVERED":
    case "COLLECTED":
      return "bg-emerald-700 text-white";
    case "CUSTOMER_UNREACHABLE":
    case "DELIVERY_REFUSED":
    case "CANCELLED":
    case "RETURNED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-ink/10 text-ink";
  }
}

export function toAdminOrderView(order: OrderWithItems) {
  return {
    id: order.id,
    number: order.number,
    displayNumber: orderStatusLabel[order.status] ? String(order.number) : String(order.number),
    customer: order.customerName,
    phone: order.phone,
    email: order.email,
    county: order.county,
    town: order.town,
    address: order.address,
    fulfilment: order.fulfilment,
    zone: order.zone,
    carrier: order.carrier ?? "—",
    payment: paymentMethodLabel[order.paymentMethod],
    paymentMethod: order.paymentMethod,
    paymentState: order.paymentState,
    paymentNote: paymentNote(order),
    mpesaCode: order.mpesaCode,
    amountExpected: order.amountExpected,
    amountConfirmed: order.amountConfirmed,
    total: order.total,
    shipping: order.shipping,
    status: order.status,
    statusLabel: orderStatusLabel[order.status],
    note: order.note,
    riderName: order.riderName,
    riderPhone: order.riderPhone,
    trackingToken: order.trackingToken,
    items: order.items.map((item) => ({
      name: item.name,
      qty: item.qty,
      size: item.size,
      price: item.unitPrice * item.qty,
      image: item.image,
    })),
  };
}

export type AdminOrderView = ReturnType<typeof toAdminOrderView>;
