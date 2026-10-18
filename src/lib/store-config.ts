import { business } from "@/lib/business";

/** Back-compat wrapper — all values come from `business`. */
export const storeConfig = {
  name: business.shortName,
  tagline: business.tagline,
  domain: business.domain,
  currency: business.currency,
  shippingFlatKes: business.shippingFlatKes,
  depositShare: business.payments.depositShare,
  whatsappNumber: business.whatsapp,
  phoneNumber: business.phone,
  contactEmail: business.email,
  adminTitle: "Swiftmall Admin",
  payments: {
    defaultMethod: "cash_on_delivery" as const,
    methods: ["deposit", "pay_now", "cash_on_delivery"] as const,
    bankAccount: business.payments.accountNumber,
    paybill: business.payments.paybill,
  },
  carriers: [] as string[],
  logo: business.logo,
};

export function kenyaPhoneDigits(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

/** Accept 07xx, 01xx, +254… — returns normalised 0XXXXXXXXX or null */
export function parseKenyaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (digits.startsWith("254") && digits.length === 12) local = `0${digits.slice(3)}`;
  if (digits.startsWith("2540") && digits.length === 13) local = digits.slice(3);
  if (!/^0[17]\d{8}$/.test(local)) return null;
  return local;
}

export function whatsappHref(message?: string): string {
  const n = kenyaPhoneDigits(storeConfig.whatsappNumber);
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function telHref(): string {
  return `tel:+${kenyaPhoneDigits(storeConfig.phoneNumber)}`;
}

export type PaymentMethod = (typeof storeConfig.payments.methods)[number];

export const paymentLabels: Record<PaymentMethod, { title: string; hint: string }> = {
  deposit: {
    title: "Pay a deposit",
    hint: "Pay exactly 50% now via M-Pesa; balance on delivery.",
  },
  pay_now: {
    title: "Pay now (M-Pesa)",
    hint: "Pay the full amount via M-Pesa Paybill before we dispatch.",
  },
  cash_on_delivery: {
    title: "Pay on delivery",
    hint: "When the rider arrives, check that the item matches your order, then pay.",
  },
};
