import { business } from "@/lib/business";

/**
 * Customer message templates (SMS / WhatsApp / email).
 * Not sent automatically — no messaging provider is wired yet.
 * Keep under 300 characters; always include order number and business phone.
 */
export type MessageTemplateId =
  | "order_received"
  | "order_confirmed"
  | "dispatched"
  | "delivered"
  | "review_request"
  | "missed_delivery";

export type MessageVars = {
  name: string;
  orderNumber: number | string;
  total: number | string;
  area?: string;
  amount?: number | string;
  riderName?: string;
  riderPhone?: string;
  returnWindow?: string;
};

function trunc(s: string, max = 300) {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

export const messageTemplates: Record<
  MessageTemplateId,
  { label: string; build: (v: MessageVars) => string }
> = {
  order_received: {
    label: "Order received",
    build: (v) =>
      trunc(
        `Hi ${v.name}, we have your ${business.brandName} order #${v.orderNumber} for KES ${v.total}. We will call to confirm shortly. ${business.phone}`,
      ),
  },
  order_confirmed: {
    label: "Order confirmed",
    build: (v) =>
      trunc(
        `Your order #${v.orderNumber} is confirmed. We will deliver to ${v.area ?? "your area"}. We will message you when it is on the way. ${business.phone}`,
      ),
  },
  dispatched: {
    label: "Dispatched",
    build: (v) =>
      trunc(
        `Your order #${v.orderNumber} is on the way. Rider: ${v.riderName ?? "—"}${v.riderPhone ? `, ${v.riderPhone}` : ""}. Keep your phone on. Pay KES ${v.amount ?? v.total} on delivery.`,
      ),
  },
  delivered: {
    label: "Delivered",
    build: (v) =>
      trunc(
        `Thanks for shopping with ${business.brandName}. If anything is not right, reply here${v.returnWindow ? ` within ${v.returnWindow}` : ""}. ${business.phone}`,
      ),
  },
  review_request: {
    label: "Review request",
    build: (v) =>
      trunc(
        `How was your order #${v.orderNumber}? Reply with a photo or a few words. We may share it on our site with your permission. ${business.phone}`,
      ),
  },
  missed_delivery: {
    label: "Missed delivery",
    build: (v) =>
      trunc(
        `We tried to reach you for order #${v.orderNumber}. Please call us on ${business.phone} so we can deliver.`,
      ),
  },
};

/** Service needed to send these automatically (not installed). */
export const messagingProviderNeeded =
  "Africa's Talking (SMS), WhatsApp Business Cloud API, or Resend (email). None is configured today — owner alerts use FormSubmit/Resend optional + Tawk only.";
