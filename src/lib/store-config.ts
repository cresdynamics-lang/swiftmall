export const storeConfig = {
  name: "Swiftmall",
  tagline: "Shopping Redefined",
  domain: "swiftmall.co.ke",
  currency: "KES",
  shippingFlatKes: 250,
  depositShare: 0.5,
  whatsappNumber: "" as string,
  contactEmail: "orders@swiftmall.co.ke",
  adminTitle: "Swiftmall Admin",
  payments: {
    defaultMethod: "pay_on_order" as const,
    methods: [
      "pay_on_order",
      "deposit",
      "cash_on_delivery",
      "pay_on_delivery",
    ] as const,
    bankAccount: "9211670018",
    paybill: null as string | null,
  },
  carriers: ["Guardian Angel Coach", "Easy Coach", "Ena Coach"],
  logo: {
    full: "/brand/logo-full.jpg",
    icon: "/brand/logo-icon.jpg",
  },
};

export type PaymentMethod = (typeof storeConfig.payments.methods)[number];

export const paymentLabels: Record<PaymentMethod, { title: string; hint: string }> = {
  pay_on_order: {
    title: "Pay on order",
    hint: "Bank transfer or M-Pesa now. We dispatch after payment.",
  },
  deposit: {
    title: "Pay a deposit",
    hint: "Pay a share now, balance on delivery.",
  },
  cash_on_delivery: {
    title: "Cash on delivery",
    hint: "Pay cash to the rider.",
  },
  pay_on_delivery: {
    title: "Pay on delivery",
    hint: "Pay by M-Pesa when it arrives.",
  },
};
