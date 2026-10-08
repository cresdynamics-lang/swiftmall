import type { OrderItem } from "@prisma/client";
import { formatKes } from "@/lib/format";
import {
  paymentMethodLabel,
  paymentNote,
  type OrderWithItems,
} from "@/lib/orders";
import { kenyaPhoneDigits, storeConfig } from "@/lib/store-config";

export type OrderNotifyPayload = {
  number: number;
  customerName: string;
  phone: string;
  email: string;
  county: string;
  town: string;
  address: string;
  paymentMethod: OrderWithItems["paymentMethod"];
  paymentState: OrderWithItems["paymentState"];
  depositPaid: number;
  subtotal: number;
  shipping: number;
  total: number;
  items: Pick<OrderItem, "name" | "qty" | "size" | "unitPrice">[];
};

export function toNotifyPayload(order: OrderWithItems): OrderNotifyPayload {
  return {
    number: order.number,
    customerName: order.customerName,
    phone: order.phone,
    email: order.email,
    county: order.county,
    town: order.town,
    address: order.address,
    paymentMethod: order.paymentMethod,
    paymentState: order.paymentState,
    depositPaid: order.depositPaid,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    items: order.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      size: i.size,
      unitPrice: i.unitPrice,
    })),
  };
}

export function formatOrderNotifyMessage(order: OrderNotifyPayload): string {
  const lines = order.items
    .map((i) => {
      const size = i.size ? ` (${i.size})` : "";
      return `• ${i.name}${size} × ${i.qty} — ${formatKes(i.unitPrice * i.qty)}`;
    })
    .join("\n");

  return [
    `New Swiftmall order #${order.number}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Delivery: ${order.address}, ${order.town}, ${order.county}`,
    "",
    `Payment: ${paymentMethodLabel[order.paymentMethod]}`,
    `Note: ${paymentNote(order)}`,
    "",
    "Items:",
    lines,
    "",
    `Subtotal: ${formatKes(order.subtotal)}`,
    `Shipping: ${formatKes(order.shipping)}`,
    `Total: ${formatKes(order.total)}`,
    "",
    `Open admin: https://${storeConfig.domain}/management/orders`,
  ].join("\n");
}

/** Flat string attributes for tawk.to setAttributes / addEvent (values must be strings). */
export function orderTawkAttributes(order: OrderNotifyPayload): Record<string, string> {
  const itemsSummary = order.items
    .map((i) => `${i.name}${i.size ? ` ${i.size}` : ""} x${i.qty}`)
    .join("; ")
    .slice(0, 450);

  return {
    orderNumber: String(order.number),
    orderTotal: formatKes(order.total),
    payment: paymentMethodLabel[order.paymentMethod],
    phone: order.phone,
    county: order.county,
    town: order.town,
    items: itemsSummary || "—",
  };
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function sendOwnerEmail(subject: string, text: string) {
  const to =
    process.env.ORDER_NOTIFY_EMAIL?.trim() ||
    "ww@swiftmall.co.ke";

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (resendKey) {
    const from =
      process.env.ORDER_NOTIFY_FROM?.trim() ||
      `Swiftmall <orders@${storeConfig.domain}>`;
    const res = await postJson(
      "https://api.resend.com/emails",
      { from, to: [to], subject, text },
      { Authorization: `Bearer ${resendKey}` },
    );
    if (!res.ok) {
      console.error("[order-notify] Resend failed", res.status, await res.text().catch(() => ""));
    }
    return;
  }

  // Zero-config fallback (FormSubmit must confirm the inbox once).
  const res = await postJson(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    _subject: subject,
    message: text,
    name: "Swiftmall Orders",
    _template: "box",
  });
  if (!res.ok) {
    console.error("[order-notify] FormSubmit failed", res.status, await res.text().catch(() => ""));
  }
}

async function sendWhatsAppCallMeBot(text: string) {
  const apiKey = process.env.WHATSAPP_NOTIFY_APIKEY?.trim();
  if (!apiKey) return;

  const phone = kenyaPhoneDigits(
    process.env.WHATSAPP_NOTIFY_PHONE?.trim() || storeConfig.whatsappNumber,
  );
  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", text.slice(0, 3500));
  url.searchParams.set("apikey", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error("[order-notify] CallMeBot failed", res.status, await res.text().catch(() => ""));
  }
}

/** Try tawk REST ticket.create when TAWK_REST_API_KEY is configured (access is invite-only). */
async function tryTawkTicket(order: OrderNotifyPayload, message: string) {
  const apiKey = process.env.TAWK_REST_API_KEY?.trim();
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID?.trim();
  if (!apiKey || !propertyId) return;

  const auth = Buffer.from(`${apiKey}:`).toString("base64");
  const res = await postJson(
    "https://api.tawk.to/v1/ticket.create",
    {
      propertyId,
      subject: `New order #${order.number} — ${formatKes(order.total)}`,
      message,
      requester: {
        name: order.customerName,
        email: order.email,
      },
    },
    { Authorization: `Basic ${auth}` },
  );
  if (!res.ok) {
    console.warn(
      "[order-notify] tawk ticket.create unavailable/failed",
      res.status,
      await res.text().catch(() => ""),
    );
  }
}

/**
 * Fire-and-forget owner alerts when an order is placed.
 * Does not throw — checkout must succeed even if notify channels fail.
 */
export async function notifyOwnerOfNewOrder(order: OrderWithItems) {
  const data = toNotifyPayload(order);
  const message = formatOrderNotifyMessage(data);
  const subject = `New Swiftmall order #${data.number} — ${formatKes(data.total)}`;

  const tasks: Promise<unknown>[] = [
    sendOwnerEmail(subject, message).catch((e) =>
      console.error("[order-notify] email", e),
    ),
    sendWhatsAppCallMeBot(message).catch((e) =>
      console.error("[order-notify] whatsapp", e),
    ),
    tryTawkTicket(data, message).catch((e) =>
      console.error("[order-notify] tawk ticket", e),
    ),
  ];

  const webhook = process.env.ORDER_NOTIFY_WEBHOOK_URL?.trim();
  if (webhook) {
    tasks.push(
      postJson(webhook, {
        event: "order.placed",
        order: data,
        message,
        tawk: {
          propertyId: process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? null,
          attributes: orderTawkAttributes(data),
        },
      }).catch((e) => console.error("[order-notify] webhook", e)),
    );
  }

  await Promise.allSettled(tasks);
}
