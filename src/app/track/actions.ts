"use server";

import { getOrderByNumberAndPhone } from "@/lib/orders";
import { parseKenyaPhone } from "@/lib/store-config";

const hits = new Map<string, number[]>();

function limited(ip: string, max = 10): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(ip, arr);
    return false;
  }
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

export async function lookupOrder(
  orderRaw: string,
  phoneRaw: string,
): Promise<{ token: string } | { error: string }> {
  if (!limited("global-track")) {
    return { error: "Too many lookups. Please wait a minute." };
  }

  const digits = orderRaw.replace(/\D/g, "");
  const number = Number(digits);
  const phone = parseKenyaPhone(phoneRaw);
  if (!Number.isFinite(number) || !phone) {
    return { error: "Check your order number and phone, then try again." };
  }

  const order = await getOrderByNumberAndPhone(number, phone);
  if (!order) {
    return { error: "We could not find that order. Check the details or WhatsApp us." };
  }
  return { token: order.trackingToken };
}
