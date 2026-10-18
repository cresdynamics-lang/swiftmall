/**
 * Single source of truth for customer-facing business facts.
 * Fields marked `confirmed: false` must not appear as live promises.
 * Never invent fees, times, or addresses — use [OWNER TO CONFIRM] in handover only.
 */
export type Confirmable<T> = { value: T; confirmed: boolean };

export type DeliveryZoneId = "nairobi" | "upcountry";

export const business = {
  brandName: "Swift Mall",
  shortName: "Swiftmall",
  tagline: "Shopping Redefined",
  domain: "swiftmall.co.ke",
  url: "https://swiftmall.co.ke",
  currency: "KES" as const,

  phone: "0727383847",
  whatsapp: "0727383847",
  /** Public contact / Reply-To — owner final answer */
  email: "swiftmall@gmail.com",
  returnsEmail: "swiftmall@gmail.com",

  /** Mail From must be a domain address (Resend); Reply-To uses email above */
  mail: {
    fromName: "Swift Mall",
    fromAddress: "noreply@swiftmall.co.ke",
    replyTo: "swiftmall@gmail.com",
    alertRecipients: ["swiftmall@gmail.com"] as const,
  },

  shippingFlatKes: 250,

  shop: {
    name: "Swift Mall",
    addressLine:
      "Simba Centre, next to Family Bank, opposite Absa, River Road and Ronald Ngala junction, Nairobi",
    floorOrShop: { value: "", confirmed: false } satisfies Confirmable<string>,
    mapUrl: {
      value: "https://maps.app.goo.gl/eQPWpEUrYLtxrsck7",
      confirmed: true,
    } satisfies Confirmable<string>,
    /** Clock hours only — combined with hoursDays in shopHoursDisplay() */
    hoursDisplay: "8am to 5pm",
    hoursDays: {
      value: "Monday to Saturday",
      confirmed: true,
    } satisfies Confirmable<string>,
    googleBusinessUrl: {
      value:
        "https://www.google.com/searchviewer/10?output=search&svid=CAwSKRInCgNwdnESIE9oWXdlREE2TUhnNE5ETTNZalV5WVRVd1ptVm1aVE0wGAo&hl=en&gl=KE",
      confirmed: true,
    } satisfies Confirmable<string>,
    /** Internal only — never show to customers */
    riderDispatchNote: {
      value: "Riders handle up to 20 kg daily",
      confirmed: false,
    } satisfies Confirmable<string>,
  },

  pickup: {
    enabled: true,
    feeKes: 0,
    readyAfterConfirmation: {
      value: "",
      confirmed: false,
    } satisfies Confirmable<string>,
    collectHint: "Bring your order number and your phone.",
    afterHoursNote:
      "Orders can be placed online any time. Pickup is Monday to Saturday, 8am to 5pm. An order placed after hours or on Sunday is collected from the next shop opening.",
  },

  deliveryZones: {
    nairobi: {
      id: "nairobi" as const,
      label: "Nairobi",
      feeKes: 250,
      promise:
        "Delivered within 24 hours of order confirmation, same day in Nairobi.",
    },
    upcountry: {
      id: "upcountry" as const,
      label: "Outside Nairobi or upcountry",
      feeKes: 250,
      promise: "We will tell you the delivery time when we confirm your order.",
    },
  },

  payments: {
    paybill: "880100",
    accountNumber: "9211670018",
    /** Do not invent — Payments page keeps generic check-the-name wording */
    paybillDisplayName: {
      value: "",
      confirmed: false,
    } satisfies Confirmable<string>,
    depositEnabled: true,
    depositShare: 0.5,
    depositRefundable: { value: false, confirmed: false } satisfies Confirmable<boolean>,
    methodsLive: ["cash_on_delivery", "pay_now", "deposit"] as const,
  },

  legalName: { value: "", confirmed: false } satisfies Confirmable<string>,
  registrationNumber: { value: "", confirmed: false } satisfies Confirmable<string>,
  city: { value: "Nairobi", confirmed: true } satisfies Confirmable<string>,
  physicalAddress: {
    value:
      "Simba Centre, next to Family Bank, opposite Absa, River Road and Ronald Ngala junction, Nairobi",
    confirmed: true,
  } satisfies Confirmable<string>,
  mapUrl: {
    value: "https://maps.app.goo.gl/eQPWpEUrYLtxrsck7",
    confirmed: true,
  } satisfies Confirmable<string>,
  pickupAvailable: { value: true, confirmed: true } satisfies Confirmable<boolean>,
  openingHours: {
    value: "Monday to Saturday, 8am to 5pm",
    confirmed: true,
  } satisfies Confirmable<string>,
  typicalReplyTime: { value: "", confirmed: false } satisfies Confirmable<string>,

  owner: {
    name: { value: "", confirmed: false } satisfies Confirmable<string>,
    role: { value: "", confirmed: false } satisfies Confirmable<string>,
    photo: { value: "", confirmed: false } satisfies Confirmable<string>,
  },

  returns: {
    reportWithinDays: { value: 5, confirmed: true } satisfies Confirmable<number>,
    reportWithinHours: { value: 120, confirmed: true } satisfies Confirmable<number>,
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
    nairobi: {
      value: "Delivered within 24 hours of order confirmation, same day in Nairobi.",
      confirmed: true,
    } satisfies Confirmable<string>,
    majorTowns: {
      value: "We will tell you the delivery time when we confirm your order.",
      confirmed: true,
    } satisfies Confirmable<string>,
    otherAreas: {
      value: "We will tell you the delivery time when we confirm your order.",
      confirmed: true,
    } satisfies Confirmable<string>,
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

  /** Tax invoicing — not implemented; accountant to advise */
  taxInvoiceNote: {
    value: "",
    confirmed: false,
  } satisfies Confirmable<string>,
} as const;

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

export function zoneForCounty(county: string): DeliveryZoneId {
  return county.trim().toLowerCase() === "nairobi" ? "nairobi" : "upcountry";
}

export function deliveryFeeForZone(zone: DeliveryZoneId): number {
  return business.deliveryZones[zone].feeKes;
}

export function deliveryPromiseForZone(zone: DeliveryZoneId): string {
  return business.deliveryZones[zone].promise;
}

export function shopAddressDisplay(): string {
  const floor = confirmedValue(business.shop.floorOrShop);
  return floor
    ? `${business.shop.addressLine} · ${floor}`
    : business.shop.addressLine;
}

export function shopHoursDisplay(): string {
  const days = confirmedValue(business.shop.hoursDays);
  return days
    ? `${days}, ${business.shop.hoursDisplay}`
    : business.shop.hoursDisplay;
}

export function formatOrderNumber(n: number): string {
  return `SM-${String(n).padStart(6, "0")}`;
}
