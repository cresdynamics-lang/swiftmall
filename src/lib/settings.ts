import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import { storeConfig } from "@/lib/store-config";

export type RuntimeSettings = {
  shippingFlatKes: number;
  depositShare: number;
  payOnOrder: boolean;
  depositEnabled: boolean;
  cashOnDelivery: boolean;
  payOnDelivery: boolean;
  carriers: string[];
  paybill: string;
  bankAccount: string;
  whatsappNumber: string;
  phoneNumber: string;
  contactEmail: string;
};

const defaults: RuntimeSettings = {
  shippingFlatKes: storeConfig.shippingFlatKes,
  depositShare: storeConfig.depositShare,
  payOnOrder: true,
  depositEnabled: true,
  cashOnDelivery: true,
  payOnDelivery: false,
  carriers: [],
  paybill: storeConfig.payments.paybill,
  bankAccount: storeConfig.payments.bankAccount,
  whatsappNumber: storeConfig.whatsappNumber,
  phoneNumber: storeConfig.phoneNumber,
  contactEmail: storeConfig.contactEmail,
};

export async function ensureStoreSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      ...defaults,
    },
  });
}

export async function getStoreSettings(): Promise<RuntimeSettings> {
  noStore();
  const row = await ensureStoreSettings();
  return {
    shippingFlatKes: row.shippingFlatKes,
    depositShare: row.depositShare,
    payOnOrder: row.payOnOrder,
    depositEnabled: row.depositEnabled,
    cashOnDelivery: row.cashOnDelivery,
    payOnDelivery: row.payOnDelivery,
    carriers: row.carriers.length ? row.carriers : defaults.carriers,
    paybill: row.paybill,
    bankAccount: row.bankAccount,
    whatsappNumber: row.whatsappNumber,
    phoneNumber: row.phoneNumber,
    contactEmail: row.contactEmail,
  };
}

export function enabledPaymentMethods(settings: RuntimeSettings) {
  const methods: Array<"deposit" | "pay_now" | "cash_on_delivery"> = [];
  if (settings.depositEnabled) methods.push("deposit");
  if (settings.payOnOrder) methods.push("pay_now");
  if (settings.cashOnDelivery) methods.push("cash_on_delivery");
  return methods.length ? methods : (["cash_on_delivery"] as const);
}
