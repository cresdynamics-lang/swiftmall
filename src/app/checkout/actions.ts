"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { queueOrderPlacedNotifications } from "@/lib/order-emails";
import { notifyOwnerOfNewOrder } from "@/lib/order-notify";
import { placeOrder } from "@/lib/orders";

function mapPaymentMethod(raw: string, fulfilment: string): PaymentMethod {
  if (fulfilment === "pickup") {
    if (raw === "pay_now" || raw === "pay_on_order") return PaymentMethod.PAY_ON_ORDER;
    return PaymentMethod.PAY_AT_PICKUP;
  }
  switch (raw) {
    case "deposit":
      return PaymentMethod.DEPOSIT;
    case "cash_on_delivery":
    case "pay_on_delivery":
      return PaymentMethod.PAY_ON_DELIVERY;
    case "pay_now":
    case "pay_on_order":
      return PaymentMethod.PAY_ON_ORDER;
    default:
      return PaymentMethod.PAY_ON_DELIVERY;
  }
}

const recentKeys = new Map<string, number>();

function rateLimit(key: string, maxPerMinute = 8): boolean {
  const now = Date.now();
  for (const [k, t] of recentKeys) {
    if (now - t > 60_000) recentKeys.delete(k);
  }
  const hits = [...recentKeys.entries()].filter(
    ([k, t]) => k.startsWith(key) && now - t < 60_000,
  ).length;
  if (hits >= maxPerMinute) return false;
  recentKeys.set(`${key}:${now}:${randomBytes(4).toString("hex")}`, now);
  return true;
}

export async function submitCheckout(formData: FormData): Promise<{
  orderNumber: number;
  trackingToken: string;
}> {
  // Honeypot
  const honey = String(formData.get("website") ?? "");
  if (honey) throw new Error("Could not place order");

  const phone = String(formData.get("phone") ?? "");
  if (!rateLimit(`order:${phone.replace(/\D/g, "").slice(-9)}`)) {
    throw new Error("Too many attempts. Please wait a minute and try again.");
  }

  const fulfilmentRaw = String(formData.get("fulfilment") ?? "delivery");
  const fulfilment = fulfilmentRaw === "pickup" ? "pickup" : "delivery";

  const linesRaw = String(formData.get("lines") ?? "[]");
  let lines: { productId: string; qty: number; size?: string }[] = [];
  try {
    lines = JSON.parse(linesRaw) as { productId: string; qty: number; size?: string }[];
  } catch {
    throw new Error("Invalid cart");
  }

  const consent = formData.get("privacyConsent") === "on" || formData.get("privacyConsent") === "true";

  const order = await placeOrder({
    name: String(formData.get("name") ?? ""),
    phone,
    email: String(formData.get("email") ?? ""),
    privacyConsent: consent,
    fulfilment,
    county: String(formData.get("county") ?? ""),
    town: String(formData.get("town") ?? ""),
    address: String(formData.get("address") ?? ""),
    streetBuilding: String(formData.get("streetBuilding") ?? ""),
    landmark: String(formData.get("landmark") ?? ""),
    deliveryNotes: String(formData.get("deliveryNotes") ?? ""),
    collectorName: String(formData.get("collectorName") ?? ""),
    paymentMethod: mapPaymentMethod(
      String(formData.get("paymentMethod") ?? ""),
      fulfilment,
    ),
    mpesaCode: String(formData.get("mpesaCode") ?? ""),
    idempotencyKey: String(formData.get("idempotencyKey") ?? "") || undefined,
    lines,
  });

  void notifyOwnerOfNewOrder(order).catch((err) =>
    console.error("[checkout] order notify failed", err),
  );
  queueOrderPlacedNotifications(order);

  revalidatePath("/management");
  revalidatePath("/management/orders");
  revalidatePath("/management/products");
  revalidatePath("/management/customers");
  revalidatePath("/management/reports");
  revalidatePath("/");

  return { orderNumber: order.number, trackingToken: order.trackingToken };
}
