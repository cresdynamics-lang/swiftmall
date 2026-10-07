/** Editable hero carousel — six department slides. Draft headlines marked in comments. */

export type HeroLayout = "circle" | "full-bleed" | "tile";

export type HeroSlideDef = {
  id: string;
  departmentSlug: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  layout: HeroLayout;
  /** Hero art — pack photos use /hero/* variants; shop photos use /products/* as-is (never upscale) */
  image: string;
  imageAlt: string;
  /** Optional responsive sources for pack photos */
  imageSrcSet?: { webp: string; jpg: string };
  focal?: string;
  /** Product slugs for the two offer cards */
  offerSlugs: [string, string];
};

const packSrc = (key: string) => ({
  webp: `/hero/${key}-800.webp 800w, /hero/${key}-1280.webp 1280w, /hero/${key}-1920.webp 1920w`,
  jpg: `/hero/${key}-800.jpg 800w, /hero/${key}-1280.jpg 1280w, /hero/${key}-1920.jpg 1920w`,
});

export const HERO_SLIDES: HeroSlideDef[] = [
  {
    // Draft copy — client to approve
    id: "fashion",
    departmentSlug: "fashion",
    eyebrow: "FASHION",
    headline: "Dress the part.",
    headlineAccent: "Pay on delivery.",
    subtext: "Men's and women's shoes, bags and more. Flat KES 250 shipping.",
    ctaLabel: "Shop Fashion →",
    ctaHref: "/category/fashion",
    layout: "circle",
    image: "/hero/fashion-1280.jpg",
    imageAlt: "Woman laughing while carrying colourful gift bags",
    imageSrcSet: packSrc("fashion"),
    focal: "center 30%",
    offerSlugs: ["mens-leather-monk-strap-shoes", "womens-watch-and-bracelet-set"],
  },
  {
    // Draft copy — client to approve
    // Uses living-room TV (file 02) — file 04 shows readable third-party app logos
    id: "electronics",
    departmentSlug: "electronics",
    eyebrow: "ELECTRONICS",
    headline: "Big screens.",
    headlineAccent: "Big sound.",
    subtext: "Screens, sound and car gear. Flat KES 250 shipping.",
    ctaLabel: "Shop Electronics →",
    ctaHref: "/category/electronics",
    layout: "full-bleed",
    image: "/hero/electronics-1280.jpg",
    imageAlt: "Living room with a large flat-screen television",
    imageSrcSet: packSrc("electronics"),
    focal: "center",
    offerSlugs: ["skyworth-65-qled-google-tv", "ecomax-2-1-multimedia-bluetooth-speakers"],
  },
  {
    // Draft copy — client to approve · tile layout for shop's 300px phone photo
    id: "phones",
    departmentSlug: "phones-and-accessories",
    eyebrow: "PHONES & ACCESSORIES",
    headline: "Handsets,",
    headlineAccent: "earbuds, chargers.",
    subtext: "Everything for your phone, delivered countrywide.",
    ctaLabel: "Shop Phones →",
    ctaHref: "/category/phones-and-accessories",
    layout: "tile",
    image: "/products/p21.jpg",
    imageAlt: "Samsung Galaxy A06 smartphone front and back",
    focal: "center",
    offerSlugs: ["samsung-galaxy-a06-smartphone", "true-wireless-bluetooth-earbuds"],
  },
  {
    // Draft copy — client to approve
    id: "gifts",
    departmentSlug: "gifts-and-accessories",
    eyebrow: "GIFTS & ACCESSORIES",
    headline: "Say it",
    headlineAccent: "with a gift.",
    subtext: "Flowers, jewellery and presents, delivered countrywide.",
    ctaLabel: "Shop Gifts →",
    ctaHref: "/category/gifts-and-accessories",
    layout: "full-bleed",
    image: "/hero/gifts-1280.jpg",
    imageAlt: "Brown leather tote bag on a yellow background",
    imageSrcSet: packSrc("gifts"),
    focal: "center",
    offerSlugs: ["roses-chrysanthemum-bouquet", "giant-pink-teddy-bear-1m"],
  },
  {
    id: "kitchen",
    departmentSlug: "kitchen-and-home",
    eyebrow: "KITCHEN & HOME APPLIANCES",
    headline: "Cook. Brew.",
    headlineAccent: "Serve.",
    subtext: "Appliances that earn their spot on the counter. Flat KES 250 shipping.",
    ctaLabel: "Shop Kitchen & Home →",
    ctaHref: "/category/kitchen-and-home",
    layout: "full-bleed",
    image: "/products/p18.jpg",
    imageAlt: "3-in-1 breakfast maker on a white background",
    focal: "center",
    offerSlugs: ["3-in-1-breakfast-maker", "ceramic-cup-saucer-set-6"],
  },
  {
    id: "beauty",
    departmentSlug: "health-and-beauty",
    eyebrow: "HEALTH & BEAUTY",
    headline: "Glow up.",
    headlineAccent: "Pay on delivery.",
    subtext: "Skincare, hair care and wellness, delivered countrywide for a flat KES 250.",
    ctaLabel: "Shop Health & Beauty →",
    ctaHref: "/category/health-and-beauty",
    layout: "tile",
    image: "/products/p01.jpg",
    imageAlt: "Licorice root facial serum bottle",
    focal: "center",
    offerSlugs: ["licorice-root-facial-serum-30ml", "black-mask-peel-off-cleansing-120g"],
  },
];

export const HERO_SLIDE_MS = 5000;
export const HERO_CROSSFADE_MS = 800;
export const HERO_MANUAL_PAUSE_MS = 10000;
