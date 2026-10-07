export type CategoryChild = {
  slug: string;
  name: string;
  children?: { slug: string; name: string }[];
};

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  blurb: string;
  /** Circular department card image under /public/categories */
  image?: string;
  children?: CategoryChild[];
};

/** Storefront department card artwork (linked by category slug). */
export const CATEGORY_IMAGES: Record<string, string> = {
  "health-and-beauty": "/categories/health-and-beauty.jpg",
  "kitchen-and-home": "/categories/kitchen-and-home.jpg",
  electronics: "/categories/electronics.jpg",
  "phones-and-accessories": "/categories/phones-and-accessories.jpg",
  "gifts-and-accessories": "/categories/gifts-and-accessories.jpg",
  fashion: "/categories/fashion.jpg",
};

export function categoryImage(slug: string): string | undefined {
  return CATEGORY_IMAGES[slug];
}

export const categories: Category[] = [
  {
    slug: "health-and-beauty",
    name: "Health & Beauty",
    shortName: "Beauty",
    blurb: "Skin, hair and wellness picks, delivered countrywide.",
    image: CATEGORY_IMAGES["health-and-beauty"],
    children: [
      { slug: "skincare", name: "Skincare" },
      { slug: "hair-care", name: "Hair care" },
      { slug: "wellness", name: "Wellness & supplements" },
      { slug: "lips-masks", name: "Lips & face masks" },
    ],
  },
  {
    slug: "kitchen-and-home",
    name: "Kitchen & Home Appliances",
    shortName: "Kitchen",
    blurb: "Cook, brew and serve.",
    image: CATEGORY_IMAGES["kitchen-and-home"],
  },
  {
    slug: "electronics",
    name: "Electronics",
    shortName: "Electronics",
    blurb: "Screens, sound and car gear.",
    image: CATEGORY_IMAGES.electronics,
  },
  {
    slug: "phones-and-accessories",
    name: "Phones & Accessories",
    shortName: "Phones",
    blurb: "Handsets, earbuds and chargers.",
    image: CATEGORY_IMAGES["phones-and-accessories"],
  },
  {
    slug: "gifts-and-accessories",
    name: "Gifts & Accessories",
    shortName: "Gifts",
    blurb: "Flowers, jewellery and presents.",
    image: CATEGORY_IMAGES["gifts-and-accessories"],
  },
  {
    slug: "fashion",
    name: "Fashion",
    shortName: "Fashion",
    blurb: "Men's and women's shoes, bags and more.",
    image: CATEGORY_IMAGES.fashion,
    children: [
      {
        slug: "mens-fashion",
        name: "Men's Fashion",
        children: [
          { slug: "mens-shoes", name: "Shoes" },
          { slug: "mens-clothing", name: "Clothing" },
          { slug: "mens-watches", name: "Watches & Belts" },
          { slug: "mens-bags", name: "Bags" },
        ],
      },
      {
        slug: "womens-fashion",
        name: "Women's Fashion",
        children: [
          { slug: "womens-shoes", name: "Shoes & Sandals" },
          { slug: "womens-clothing", name: "Clothing" },
          { slug: "womens-handbags", name: "Handbags & Wallets" },
          { slug: "womens-jewellery", name: "Jewellery" },
        ],
      },
    ],
  },
  {
    slug: "others",
    name: "Others",
    shortName: "Others",
    blurb: "Fitness and everything else.",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
