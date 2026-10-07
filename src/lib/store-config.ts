export const storeConfig = {
  name: "Swiftmall",
  tagline: "Shopping Redefined",
  domain: "swiftmall.co.ke",
  currency: "KES",
  shippingFlatKes: 250,
  depositShare: 0.5,
  /** Display / dial number for WhatsApp and calls */
  whatsappNumber: "0727383847",
  phoneNumber: "0727383847",
  contactEmail: "orders@swiftmall.co.ke",
  adminTitle: "Swiftmall Admin",
  payments: {
    defaultMethod: "cash_on_delivery" as const,
    /** Customer-facing checkout methods only */
    methods: ["deposit", "pay_now", "cash_on_delivery"] as const,
    bankAccount: "9211670018",
    paybill: "880100",
  },
  /** Internal only — never shown to shoppers */
  carriers: [] as string[],
  logo: {
    full: "/brand/logo-full.jpg",
    icon: "/brand/logo-icon.jpg",
  },
};

/** Kenya mobile → international digits for wa.me / tel links */
export function kenyaPhoneDigits(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
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
    hint: "Pay a share now via M-Pesa, balance on delivery.",
  },
  pay_now: {
    title: "Pay now",
    hint: "Pay the full amount via M-Pesa Paybill before we dispatch.",
  },
  cash_on_delivery: {
    title: "Cash on delivery",
    hint: "Pay cash to the rider when your order arrives.",
  },
};
