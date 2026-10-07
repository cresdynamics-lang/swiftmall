import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const COOKIE = "swiftmall_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

function sessionToken(customerId: string, email: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? "swiftmall-customer";
  return createHash("sha256").update(`${customerId}:${email}:${secret}`).digest("hex");
}

export async function setCustomerSession(customerId: string, email: string) {
  const jar = await cookies();
  jar.set(COOKIE, `${customerId}.${sessionToken(customerId, email)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getCustomerSession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [customerId, token] = raw.split(".");
  if (!customerId || !token) return null;
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer?.passwordHash) return null;
  if (token !== sessionToken(customer.id, customer.email)) return null;
  return customer;
}
