import type { Order, OrderItem, OrderStatus } from "@prisma/client";
import {
  business,
  deliveryPromiseForZone,
  formatOrderNumber,
  pickupReadyDisplay,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";
import { formatKes } from "@/lib/format";
import { sendMail, sendOwnerAlert } from "@/lib/mail";
import {
  formatOrderNotifyMessage,
  toNotifyPayload,
} from "@/lib/order-notify";
import {
  orderStatusLabel,
  paymentMethodLabel,
  paymentNote,
  type OrderWithItems,
} from "@/lib/orders";

type OrderMail = Order & { items: OrderItem[] };

function trackUrl(token: string) {
  return `${business.url}/track/${token}`;
}

function invoiceUrl(token: string) {
  return `${business.url}/order/${token}/invoice`;
}

function shell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="color-scheme" content="light dark"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;color:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;color:#111111;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
<tr><td style="background:#111111;padding:20px 24px;">
<p style="margin:0;font-size:20px;font-weight:700;color:#FFC400;">${business.brandName}</p>
<p style="margin:6px 0 0;font-size:13px;color:#ffffff;">${title}</p>
</td></tr>
<tr><td style="padding:24px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111111;">
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 24px;background:#fafafa;font-size:12px;color:#444;border-top:1px solid #eee;">
<p style="margin:0;">WhatsApp / Call ${business.phone}</p>
<p style="margin:4px 0 0;">Email ${business.email}</p>
<p style="margin:8px 0 0;">${shopAddressDisplay()}</p>
<p style="margin:4px 0 0;">Shop hours: ${shopHoursDisplay()}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function itemsTable(items: OrderItem[]) {
  const rows = items
    .map((i) => {
      const variant = i.size ? ` (${i.size})` : "";
      return `<tr>
<td style="padding:8px 0;border-bottom:1px solid #eee;color:#111;">${escape(i.name)}${variant}${i.sku ? `<br/><span style="font-size:12px;color:#666;">SKU ${escape(i.sku)}</span>` : ""}</td>
<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#111;">${i.qty}</td>
<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#111;">${formatKes(i.unitPrice * i.qty)}</td>
</tr>`;
    })
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
<tr><th align="left" style="color:#666;font-size:12px;">Item</th><th align="right" style="color:#666;font-size:12px;">Qty</th><th align="right" style="color:#666;font-size:12px;">Amount</th></tr>
${rows}</table>`;
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fulfilmentBlock(order: OrderMail) {
  if (order.fulfilment === "PICKUP") {
    const ready = pickupReadyDisplay();
    return `<p><strong>Pickup at the shop</strong><br/>${escape(shopAddressDisplay())}<br/>Hours: ${escape(shopHoursDisplay())}${ready ? `<br/>${escape(ready)}` : ""}<br/>${escape(business.pickup.collectHint)}<br/>${escape(business.pickup.afterHoursNote)}${order.collectorName ? `<br/>Collector: ${escape(order.collectorName)}` : ""}</p>`;
  }
  const promise =
    order.zone === "NAIROBI"
      ? business.deliveryZones.nairobi.promise
      : business.deliveryZones.upcountry.promise;
  return `<p><strong>Delivery</strong><br/>${escape(order.address)}<br/>${escape(promise)}</p>`;
}

function totalsBlock(order: OrderMail) {
  const feeLabel =
    order.fulfilment === "PICKUP"
      ? `Pickup ${formatKes(0)}`
      : `Delivery ${formatKes(order.shipping)}`;
  let payExtra = "";
  if (order.paymentMethod === "DEPOSIT") {
    const now = Math.round(order.total * business.payments.depositShare);
    const bal = order.total - now;
    payExtra = `<p>Pay now ${formatKes(now)}, balance ${formatKes(bal)}.</p>`;
  }
  return `<p>Subtotal ${formatKes(order.subtotal)}<br/>${feeLabel}<br/><strong>Total ${formatKes(order.total)}</strong></p>
<p>Payment: ${paymentMethodLabel[order.paymentMethod]} · ${paymentNote(order)}</p>${payExtra}`;
}

function cta(order: OrderMail) {
  return `<p style="margin:20px 0;">
<a href="${trackUrl(order.trackingToken)}" style="display:inline-block;background:#FFC400;color:#111;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;margin-right:8px;">Track your order</a>
<a href="${invoiceUrl(order.trackingToken)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:8px;">Print invoice</a>
</p>`;
}

function textBase(order: OrderMail, intro: string) {
  return [
    intro,
    "",
    `Order ${formatOrderNumber(order.number)}`,
    ...order.items.map(
      (i) =>
        `- ${i.name}${i.size ? ` (${i.size})` : ""} x${i.qty} ${formatKes(i.unitPrice * i.qty)}`,
    ),
    `Subtotal ${formatKes(order.subtotal)}`,
    order.fulfilment === "PICKUP"
      ? `Pickup ${formatKes(0)}`
      : `Delivery ${formatKes(order.shipping)}`,
    `Total ${formatKes(order.total)}`,
    `Payment: ${paymentMethodLabel[order.paymentMethod]}`,
    paymentNote(order),
    "",
    order.fulfilment === "PICKUP"
      ? `Pickup: ${shopAddressDisplay()} · ${shopHoursDisplay()}`
      : `Delivery: ${order.address}`,
    "",
    `Track: ${trackUrl(order.trackingToken)}`,
    `Invoice: ${invoiceUrl(order.trackingToken)}`,
    "",
    `WhatsApp/Call ${business.phone} · ${business.email}`,
  ].join("\n");
}

export async function queueCustomerOrderEmail(
  order: OrderWithItems,
  kind:
    | "received"
    | "confirmed"
    | "payment"
    | "dispatched"
    | "ready_pickup"
    | "delivered"
    | "cancelled",
) {
  if (!order.email) return;
  const num = formatOrderNumber(order.number);
  let subject = `${business.brandName} order ${num}`;
  let title = "Thank you for your order";
  let lead = `<p>Hi ${escape(order.customerName)}, thanks for ordering from ${business.brandName}.</p>`;

  if (kind === "confirmed") {
    subject = `Order ${num} confirmed`;
    title = "Your order is confirmed";
    lead = `<p>Hi ${escape(order.customerName)}, we have confirmed your order by call or WhatsApp.</p>`;
  } else if (kind === "payment") {
    subject = `Payment update for ${num}`;
    title = "Payment update";
    lead = `<p>Hi ${escape(order.customerName)}, ${escape(paymentNote(order))}.</p>`;
  } else if (kind === "dispatched") {
    subject = `Order ${num} is on the way`;
    title = "Your order is on the way";
    lead = `<p>Hi ${escape(order.customerName)}, your order has been dispatched.</p>${
      order.riderName
        ? `<p>Rider: ${escape(order.riderName)}${order.riderPhone ? ` · ${escape(order.riderPhone)}` : ""}</p>`
        : ""
    }`;
  } else if (kind === "ready_pickup") {
    subject = `Order ${num} ready for pickup`;
    title = "Ready for pickup";
    lead = `<p>Hi ${escape(order.customerName)}, your order is ready for pickup.</p>`;
  } else if (kind === "delivered") {
    subject = `Order ${num} ${order.fulfilment === "PICKUP" ? "collected" : "delivered"}`;
    title = "Thank you";
    lead = `<p>Hi ${escape(order.customerName)}, thank you for shopping with us. You have ${business.returns.reportWithinDays.value} days to report an issue on WhatsApp ${business.whatsapp} or email ${business.returnsEmail}.</p>`;
  } else if (kind === "cancelled") {
    subject = `Order ${num} cancelled`;
    title = "Order cancelled";
    lead = `<p>Hi ${escape(order.customerName)}, your order has been cancelled.${order.customerNote ? ` ${escape(order.customerNote)}` : ""}</p>`;
  } else {
    // received — payment instructions
    if (order.paymentMethod === "PAY_ON_ORDER" || order.paymentMethod === "DEPOSIT") {
      lead += `<p>Pay now (M-Pesa): Lipa na M-Pesa, Paybill ${business.payments.paybill}, Account ${business.payments.accountNumber}, Amount: ${formatKes(order.amountExpected || order.total)}.</p>
<p>Confirm the business name on your M-Pesa screen before you finish. If it does not look right, stop and call ${business.phone}.</p>`;
    } else if (order.paymentMethod === "PAY_AT_PICKUP") {
      lead += `<p>Pay when you collect — inspect the item at the shop, then pay.</p>`;
    } else {
      lead += `<p>When the rider arrives, check that the item matches your order, then pay.</p>`;
    }
  }

  const html = shell(
    title,
    `${lead}${itemsTable(order.items)}${totalsBlock(order)}${fulfilmentBlock(order)}${cta(order)}`,
  );
  const text = textBase(order, title);

  // Fire-and-forget — never block checkout
  void sendMail({
    to: order.email,
    subject,
    text,
    html,
    template: `order_${kind}`,
    orderId: order.id,
  }).catch((e) => console.error("[order-email]", e));
}

export async function queueOrderPlacedNotifications(order: OrderWithItems) {
  const payload = toNotifyPayload(order);
  const message = formatOrderNotifyMessage(payload);
  void sendOwnerAlert(
    `New ${business.brandName} order ${formatOrderNumber(order.number)}`,
    message,
    order.id,
  ).catch((e) => console.error("[owner-alert]", e));
  void queueCustomerOrderEmail(order, "received");
}

export function shouldEmailForStatus(status: OrderStatus): Parameters<
  typeof queueCustomerOrderEmail
>[1] | null {
  switch (status) {
    case "CONFIRMED":
      return "confirmed";
    case "DISPATCHED":
      return "dispatched";
    case "READY_FOR_PICKUP":
      return "ready_pickup";
    case "DELIVERED":
    case "COLLECTED":
      return "delivered";
    case "CANCELLED":
      return "cancelled";
    default:
      return null;
  }
}

// silence unused import in case zone helper needed later
void deliveryPromiseForZone;
