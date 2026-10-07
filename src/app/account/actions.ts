"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearCustomerSession,
  getCustomerSession,
  hashPassword,
  setCustomerSession,
  verifyPassword,
} from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export async function createTrackingPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const orderNumber = Number(formData.get("orderNumber") ?? 0);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!email || !orderNumber) throw new Error("Missing order details");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");
  if (password !== confirm) throw new Error("Passwords do not match");

  const order = await prisma.order.findFirst({
    where: { number: orderNumber, email },
    include: { customer: true },
  });
  if (!order?.customer) throw new Error("Order not found for that email");

  await prisma.customer.update({
    where: { id: order.customer.id },
    data: { passwordHash: hashPassword(password) },
  });
  await setCustomerSession(order.customer.id, order.customer.email);
  revalidatePath("/account");
  redirect("/account");
}

export async function customerLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/account?error=1");
  }

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.passwordHash || !verifyPassword(password, customer.passwordHash)) {
    redirect("/account?error=1");
  }

  await setCustomerSession(customer.id, customer.email);
  revalidatePath("/account");
  redirect("/account");
}

export async function customerLogout() {
  await clearCustomerSession();
  revalidatePath("/account");
  redirect("/account");
}

export async function requireCustomer() {
  return getCustomerSession();
}
