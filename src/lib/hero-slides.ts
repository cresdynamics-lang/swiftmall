/** Campaign hero slides — editable copy lives here, not in the component. */

export type HeroTheme = "night" | "sun" | "paper";
export type HeroBgShape = "side" | "circle" | "none";

export type HeroSlideDef = {
  id: string;
  departmentSlug: string;
  theme: HeroTheme;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  background?: string;
  backgroundAlt?: string;
  backgroundShape: HeroBgShape;
  imageSrcSet?: { webp: string; jpg: string };
  focal?: string;
  /** 2–3 product slugs; prices/photos come from catalogue */
  productSlugs: string[];
  campaignName?: string;
  campaignDates?: string;
};

const packSrc = (key: string) => ({
  webp: `/hero/${key}-800.webp 800w, /hero/${key}-1280.webp 1280w, /hero/${key}-1920.webp 1920w`,
  jpg: `/hero/${key}-800.jpg 800w, /hero/${key}-1280.jpg 1280w, /hero/${key}-1920.jpg 1920w`,
});

/** Order: Electronics, Kitchen, Fashion, Phones, Gifts, Beauty */
export const HERO_SLIDES: HeroSlideDef[] = [
  {
    id: "electronics",
    departmentSlug: "electronics",
    theme: "night",
    eyebrow: "ELECTRONICS",
    headline: "Big screens.",
    headlineAccent: "Big sound.",
    tagline: "Screens, sound and car gear",
    ctaLabel: "Shop Electronics →",
    ctaHref: "/category/electronics",
    // Pack file 02 — file 04 has readable third-party app logos
    background: "/hero/electronics-1280.jpg",
    backgroundAlt: "Living room with a large flat-screen television",
    backgroundShape: "side",
    imageSrcSet: packSrc("electronics"),
    productSlugs: [
      "skyworth-65-qled-google-tv",
      "ecomax-2-1-multimedia-bluetooth-speakers",
      "car-jump-starter-air-compressor-kit",
    ],
  },
  {
    id: "kitchen",
    departmentSlug: "kitchen-and-home",
    theme: "sun",
    eyebrow: "KITCHEN & HOME APPLIANCES",
    headline: "Cook. Brew.",
    headlineAccent: "Serve.",
    tagline: "Appliances that earn their spot",
    ctaLabel: "Shop Kitchen & Home →",
    ctaHref: "/category/kitchen-and-home",
    backgroundShape: "none",
    productSlugs: ["3-in-1-breakfast-maker", "ceramic-cup-saucer-set-6"],
  },
  {
    // Draft copy — client to approve
    id: "fashion",
    departmentSlug: "fashion",
    theme: "paper",
    eyebrow: "FASHION",
    headline: "Dress the part.",
    headlineAccent: "Pay on delivery.",
    tagline: "Shoes, bags and more",
    ctaLabel: "Shop Fashion →",
    ctaHref: "/category/fashion",
    background: "/hero/fashion-1280.jpg",
    backgroundAlt: "Woman laughing while carrying colourful gift bags",
    backgroundShape: "circle",
    imageSrcSet: packSrc("fashion"),
    focal: "center 30%",
    productSlugs: [
      "mens-leather-monk-strap-shoes",
      "womens-clear-block-heel-sandals",
      "womens-comfort-toe-loop-sandals",
    ],
  },
  {
    // Draft copy — client to approve
    id: "phones",
    departmentSlug: "phones-and-accessories",
    theme: "night",
    eyebrow: "PHONES & ACCESSORIES",
    headline: "Handsets,",
    headlineAccent: "earbuds, chargers.",
    tagline: "Everything for your phone",
    ctaLabel: "Shop Phones →",
    ctaHref: "/category/phones-and-accessories",
    backgroundShape: "none",
    productSlugs: [
      "samsung-galaxy-a06-smartphone",
      "true-wireless-bluetooth-earbuds",
    ],
  },
  {
    // Draft copy — client to approve
    id: "gifts",
    departmentSlug: "gifts-and-accessories",
    theme: "sun",
    eyebrow: "GIFTS & ACCESSORIES",
    headline: "Say it",
    headlineAccent: "with a gift.",
    tagline: "Flowers, jewellery and presents",
    ctaLabel: "Shop Gifts →",
    ctaHref: "/category/gifts-and-accessories",
    background: "/hero/gifts-1280.jpg",
    backgroundAlt: "Brown leather tote bag on a yellow background",
    backgroundShape: "side",
    imageSrcSet: packSrc("gifts"),
    productSlugs: [
      "roses-chrysanthemum-bouquet",
      "giant-pink-teddy-bear-1m",
      "gold-pendant-necklace-black-stone",
    ],
  },
  {
    id: "beauty",
    departmentSlug: "health-and-beauty",
    theme: "paper",
    eyebrow: "HEALTH & BEAUTY",
    headline: "Glow up.",
    headlineAccent: "Pay on delivery.",
    tagline: "Skin, hair and wellness picks",
    ctaLabel: "Shop Health & Beauty →",
    ctaHref: "/category/health-and-beauty",
    backgroundShape: "none",
    productSlugs: [
      "licorice-root-facial-serum-30ml",
      "black-mask-peel-off-cleansing-120g",
      "slim-green-coffee-15-sachets",
    ],
  },
];

export const HERO_SLIDE_MS = 4000;
export const HERO_CROSSFADE_MS = 600;
export const HERO_MANUAL_PAUSE_MS = 10000;

/** Quick-search links under the search bar — real department names only */
export const QUICK_SEARCH_LINKS = [
  { label: "Fashion", href: "/category/fashion" },
  { label: "Electronics", href: "/category/electronics" },
  { label: "Phones", href: "/category/phones-and-accessories" },
  { label: "Kitchen", href: "/category/kitchen-and-home" },
  { label: "Beauty", href: "/category/health-and-beauty" },
] as const;
