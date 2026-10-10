/**
 * Single source of truth for trust pages, SEO and customer messaging.
 * Fields marked `confirmed: false` must not appear in live customer-facing copy
 * until the owner supplies them. Never invent values.
 */
export type Confirmable<T> = { value: T; confirmed: boolean };

export const business = {
  brandName: "Swift Mall",
  /** Short storefront name used in titles */
  shortName: "Swiftmall",
  tagline: "Shopping Redefined",
  domain: "swiftmall.co.ke",
  url: "https://swiftmall.co.ke",
  currency: "KES" as const,

  phone: "0727383847",
  whatsapp: "0727383847",
  email: "orders@swiftmall.co.ke",
  /** Returns / complaints inbox (from published return policy) */
  returnsEmail: "ww.swiftmall@gmail.com",

  shippingFlatKes: 250,

  payments: {
    paybill: "880100",
    /** Account number buyers enter at Lipa na M-Pesa */
    accountNumber: "9211670018",
    /** Name shown on M-Pesa confirmation — must match live Paybill */
    paybillDisplayName: {
      value: "",
      confirmed: false,
    } satisfies Confirmable<string>,
    depositEnabled: true,
    depositShare: 0.5,
    /** Whether deposit is refundable */
    depositRefundable: { value: false, confirmed: false } satisfies Confirmable<boolean>,
    methodsLive: ["cash_on_delivery", "pay_now", "deposit"] as const,
  },

  legalName: { value: "", confirmed: false } satisfies Confirmable<string>,
  registrationNumber: { value: "", confirmed: false } satisfies Confirmable<string>,
  city: { value: "", confirmed: false } satisfies Confirmable<string>,
  physicalAddress: { value: "", confirmed: false } satisfies Confirmable<string>,
  mapUrl: { value: "", confirmed: false } satisfies Confirmable<string>,
  pickupAvailable: { value: false, confirmed: false } satisfies Confirmable<boolean>,
  openingHours: { value: "", confirmed: false } satisfies Confirmable<string>,
  typicalReplyTime: { value: "", confirmed: false } satisfies Confirmable<string>,

  owner: {
    name: { value: "", confirmed: false } satisfies Confirmable<string>,
    role: { value: "", confirmed: false } satisfies Confirmable<string>,
    photo: { value: "", confirmed: false } satisfies Confirmable<string>,
  },

  returns: {
    /** Complaint / return request window after delivery */
    reportWithinDays: { value: 5, confirmed: true } satisfies Confirmable<number>,
    /** Kept for older UI that mentioned hours — 5 days */
    reportWithinHours: { value: 120, confirmed: true } satisfies Confirmable<number>,
    /** Change-of-mind / correctly delivered returns allowed with processing fee */
    changeOfMind: { value: true, confirmed: true } satisfies Confirmable<boolean>,
    processingFeePercent: { value: 10, confirmed: true } satisfies Confirmable<number>,
    nonReturnable: {
      value: [
        "Products altered from original condition, or opened without authorised permission",
        "Products with tampered or missing serial / UPC numbers",
        "Perishable goods (unless a valid issue is raised at delivery and confirmed by the dispatcher)",
        "Products damaged due to misuse",
        "Beauty, health and personal care products",
        "Jewellery, innerwear, bed sheets, lingerie and socks",
        "Books",
        "Underwear",
        "Adult toys",
        "Groceries",
        "Perfumes",
        "Cosmetics",
        "Hair extensions",
      ],
      confirmed: true,
    } satisfies Confirmable<string[]>,
    refundMethod: {
      value: "Refund or exchange once the returned item is received and inspected, as you prefer",
      confirmed: true,
    } satisfies Confirmable<string>,
    refundDays: { value: 0, confirmed: false } satisfies Confirmable<number>,
  },

  delivery: {
    nairobi: { value: "", confirmed: false } satisfies Confirmable<string>,
    majorTowns: { value: "", confirmed: false } satisfies Confirmable<string>,
    otherAreas: { value: "", confirmed: false } satisfies Confirmable<string>,
    retryPolicy: { value: "", confirmed: false } satisfies Confirmable<string>,
  },

  warranty: {
    electronics: { value: "", confirmed: false } satisfies Confirmable<string>,
    phones: { value: "", confirmed: false } satisfies Confirmable<string>,
    kitchen: { value: "", confirmed: false } satisfies Confirmable<string>,
  },

  social: {
    facebook: { value: "", confirmed: false } satisfies Confirmable<string>,
    instagram: { value: "", confirmed: false } satisfies Confirmable<string>,
  },

  logo: {
    full: "/brand/logo-full.jpg",
    icon: "/brand/logo-icon.jpg",
  },

  departments: [
    { slug: "health-and-beauty", name: "Health & Beauty", blurb: "Skin, hair and wellness." },
    {
      slug: "kitchen-and-home",
      name: "Kitchen & Home Appliances",
      blurb: "Cook, brew and serve at home.",
    },
    { slug: "electronics", name: "Electronics", blurb: "Screens, sound and car gear." },
    {
      slug: "phones-and-accessories",
      name: "Phones & Accessories",
      blurb: "Handsets, earbuds and chargers.",
    },
    {
      slug: "gifts-and-accessories",
      name: "Gifts & Accessories",
      blurb: "Flowers, jewellery and presents.",
    },
    { slug: "fashion", name: "Fashion", blurb: "Shoes, bags and more." },
  ],
} as const;

/** Trust pages that may go live only when every required fact is confirmed. */
export const trustPagePublish = {
  about: false,
  howToOrder: true,
  delivery: true,
  returns: true,
  warranty: false,
  payments: true,
  contact: true,
  faq: true,
} as const;

export type TrustPageKey = keyof typeof trustPagePublish;

export function isTrustPageLive(key: TrustPageKey): boolean {
  return trustPagePublish[key];
}

export function confirmedValue<T>(field: Confirmable<T>): T | null {
  return field.confirmed ? field.value : null;
}
