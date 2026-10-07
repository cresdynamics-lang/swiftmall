"use server";

import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { placeOrder } from "@/lib/orders";
import { getStoreSettings } from "@/lib/settings";

function mapPaymentMethod(raw: string): PaymentMethod {
  switch (raw) {
    case "deposit":
      return PaymentMethod.DEPOSIT;
    case "cash_on_delivery":
      return PaymentMethod.CASH_ON_DELIVERY;
    case "pay_now":
    case "pay_on_order":
      return PaymentMethod.PAY_ON_ORDER;
    case "pay_on_delivery":
      return PaymentMethod.PAY_ON_DELIVERY;
    default:
      return PaymentMethod.CASH_ON_DELIVERY;
  }
}

export async function submitCheckout(formData: FormData): Promise<{ orderNumber: number }> {
  const settings = await getStoreSettings();
  const linesRaw = String(formData.get("lines") ?? "[]");
  let lines: { productId: string; qty: number; size?: string }[] = [];
  try {
    lines = JSON.parse(linesRaw) as { productId: string; qty: number; size?: string }[];
  } catch {
    throw new Error("Invalid cart");
  }

  const order = await placeOrder({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    county: String(formData.get("county") ?? ""),
    town: String(formData.get("town") ?? ""),
    address: String(formData.get("address") ?? ""),
    paymentMethod: mapPaymentMethod(String(formData.get("paymentMethod") ?? "")),
    shipping: settings.shippingFlatKes,
    depositShare: settings.depositShare,
    lines,
  });

  revalidatePath("/management");
  revalidatePath("/management/orders");
  revalidatePath("/management/products");
  revalidatePath("/management/customers");
  revalidatePath("/management/reports");
  revalidatePath("/");

  return { orderNumber: order.number };
}
