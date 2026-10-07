export type OfferTag = "NONE" | "TODAY" | "THIS_WEEK" | "NEW";
export type Gender = "mens" | "womens";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName?: string;
  subCategory?: string;
  brand?: string;
  sku?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  lowStockAt?: number;
  images: string[];
  description: string;
  flashDeal: boolean;
  featured: boolean;
  live: boolean;
  offerTag: OfferTag;
  gender?: Gender;
  /** Available sizes shoppers can pick (shoes EU, teddy cm, or custom) */
  sizes: string[];
};

export const OFFER_TAG_OPTIONS: { value: OfferTag; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "TODAY", label: "Today (e.g. -19% today)" },
  { value: "THIS_WEEK", label: "This week (e.g. -17% this week)" },
  { value: "NEW", label: "New" },
];
