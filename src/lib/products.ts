export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subCategory?: string;
  brand?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
  description: string;
  flashDeal?: boolean;
  featured?: boolean;
  gender?: "mens" | "womens";
};

export const products: Product[] = [
  {
    id: "p01",
    slug: "licorice-root-facial-serum-30ml",
    name: "Licorice Root Anti-Inflammatory Facial Serum 30ml",
    category: "health-and-beauty",
    subCategory: "Skincare",
    brand: "Roushun Beauty",
    price: 850,
    oldPrice: 1100,
    stock: 24,
    images: ["/products/p01.jpg"],
    description:
      "Herbal licorice-root serum for calming, brightening and moisturising. 30ml dropper bottle.",
    flashDeal: true,
    featured: true,
  },
  {
    id: "p02",
    slug: "ginger-hair-growth-essential-oil-30ml",
    name: "Ginger Hair Growth Essential Oil 30ml",
    category: "health-and-beauty",
    subCategory: "Hair care",
    brand: "King of Ginger",
    price: 750,
    stock: 40,
    images: ["/products/p02.jpg"],
    description: "Ginger germinal oil for scalp nourishment and hair growth support. 30ml.",
    featured: true,
  },
  {
    id: "p03",
    slug: "black-mask-peel-off-cleansing-120g",
    name: "Black Mask Peel-off Cleansing, 120g",
    category: "health-and-beauty",
    subCategory: "Lips & face masks",
    brand: "Aichun Beauty",
    price: 650,
    oldPrice: 900,
    stock: 35,
    images: ["/products/p03.jpg"],
    description: "Peel-off cleansing mask for deep clean and refreshed skin.",
    flashDeal: true,
  },
  {
    id: "p04",
    slug: "strawberry-moisturising-lip-balm",
    name: "Strawberry Moisturising Lip Balm",
    category: "health-and-beauty",
    subCategory: "Lips & face masks",
    brand: "Aichun Beauty",
    price: 350,
    stock: 60,
    images: ["/products/p04.jpg"],
    description: "Highly concentrated moisturising strawberry lip balm, 10g tube.",
    featured: true,
  },
  {
    id: "p05",
    slug: "slim-green-coffee-15-sachets",
    name: "Slim Green Coffee, 15 sachets",
    category: "health-and-beauty",
    subCategory: "Wellness & supplements",
    brand: "WinTown",
    price: 1200,
    oldPrice: 1500,
    stock: 18,
    images: ["/products/p05.jpg"],
    description: "Natural slim green coffee sachets for daily wellness support.",
  },
  {
    id: "p06",
    slug: "collagen-peptides-powder-20-sachets",
    name: "Collagen Peptides Powder, 20 sachets",
    category: "health-and-beauty",
    subCategory: "Wellness & supplements",
    price: 2400,
    stock: 12,
    images: ["/products/p06.jpg"],
    description: "Collagen peptide sachets for skin and joint support.",
  },
  {
    id: "p18",
    slug: "3-in-1-breakfast-maker",
    name: "3-in-1 Breakfast Maker: Oven, Pan, Coffee",
    category: "kitchen-and-home",
    brand: "HomeChef",
    price: 6500,
    oldPrice: 8000,
    stock: 8,
    images: ["/products/p18.jpg"],
    description: "Compact breakfast station with toaster oven, griddle and drip coffee maker.",
    flashDeal: true,
    featured: true,
  },
  {
    id: "p17",
    slug: "ceramic-cup-saucer-set-6",
    name: "Ceramic Cup & Saucer Set, 6 pieces",
    category: "kitchen-and-home",
    price: 2200,
    stock: 15,
    images: ["/products/p17.jpg"],
    description: "Modern white ceramic mugs with wave saucers - set of six.",
    featured: true,
  },
  {
    id: "p19",
    slug: "ecomax-2-1-multimedia-bluetooth-speakers",
    name: "Ecomax 2.1 Multimedia Bluetooth Speakers",
    category: "electronics",
    brand: "ECOMAX",
    price: 7800,
    stock: 10,
    images: ["/products/p19.jpg"],
    description: "2.1 channel multimedia speakers with Bluetooth, USB and SD support.",
    featured: true,
  },
  {
    id: "p23",
    slug: "car-jump-starter-air-compressor-kit",
    name: "Car Jump Starter & Air Compressor Kit",
    category: "electronics",
    brand: "HIGH POWER",
    price: 5500,
    stock: 9,
    images: ["/products/p23.jpg"],
    description: "Automobile emergency jump starter with air compressor, cables and case.",
    featured: true,
  },
  {
    id: "p24",
    slug: "skyworth-65-qled-google-tv",
    name: 'Skyworth 65" QLED Google TV',
    category: "electronics",
    brand: "Skyworth",
    price: 62000,
    oldPrice: 75000,
    stock: 3,
    images: ["/products/p24.jpg"],
    description: "65-inch QLED Google TV with smart apps and vivid colour.",
    flashDeal: true,
  },
  {
    id: "p21",
    slug: "samsung-galaxy-a06-smartphone",
    name: "Samsung Galaxy A06 Smartphone",
    category: "phones-and-accessories",
    brand: "Samsung",
    price: 12500,
    stock: 20,
    images: ["/products/p21.jpg"],
    description: "Samsung Galaxy A06 - dual camera, large display, everyday performance.",
    featured: true,
  },
  {
    id: "p20",
    slug: "true-wireless-bluetooth-earbuds",
    name: "True Wireless Bluetooth Earbuds",
    category: "phones-and-accessories",
    price: 2400,
    stock: 25,
    images: ["/products/p20.jpg"],
    description: "Comfortable true wireless earbuds with charging case.",
    featured: true,
  },
  {
    id: "p13",
    slug: "roses-chrysanthemum-bouquet",
    name: "Roses & Chrysanthemum Bouquet",
    category: "gifts-and-accessories",
    price: 3500,
    stock: 14,
    images: ["/products/p13.jpg"],
    description: "Fresh roses and chrysanthemums, gift-wrapped with ribbon.",
    featured: true,
  },
  {
    id: "p14",
    slug: "giant-pink-teddy-bear-1m",
    name: "Giant Pink Teddy Bear, 1m",
    category: "gifts-and-accessories",
    price: 2800,
    stock: 6,
    images: ["/products/p14.jpg"],
    description: "Soft giant pink teddy with Love heart patch - ideal gift.",
    featured: true,
  },
  {
    id: "p15",
    slug: "gold-pendant-necklace-black-stone",
    name: "Gold Pendant Necklace, Black Stone",
    category: "gifts-and-accessories",
    price: 1200,
    stock: 22,
    images: ["/products/p15.jpg"],
    description: "Gold-tone pendant necklace with black stone accent.",
  },
  {
    id: "p16",
    slug: "womens-watch-and-bracelet-set",
    name: "Women’s Watch & Bracelet Set",
    category: "gifts-and-accessories",
    price: 1800,
    oldPrice: 2500,
    stock: 12,
    images: ["/products/p16.jpg"],
    description:
      "Rectangular green-dial watch with magnetic mesh strap, sold with a matching open bangle.",
    flashDeal: true,
    featured: true,
  },
  {
    id: "p07",
    slug: "mens-leather-monk-strap-shoes",
    name: "Men’s Leather Monk-Strap Shoes",
    category: "fashion",
    subCategory: "Shoes",
    gender: "mens",
    price: 4800,
    oldPrice: 6000,
    stock: 8,
    images: ["/products/p07.jpg"],
    description: "Polished brown leather monk-strap brogues with brass buckle.",
    featured: true,
  },
  {
    id: "p09",
    slug: "mens-leather-oxford-shoes-brown",
    name: "Men’s Leather Oxford Shoes, Brown",
    category: "fashion",
    subCategory: "Shoes",
    gender: "mens",
    price: 4500,
    stock: 10,
    images: ["/products/p09.jpg"],
    description: "Classic brown leather Oxford shoes for work and occasions.",
  },
  {
    id: "p08",
    slug: "womens-comfort-toe-loop-sandals",
    name: "Women’s Comfort Toe-Loop Sandals",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: "womens",
    price: 1600,
    stock: 16,
    images: ["/products/p08.jpg"],
    description: "Black platform toe-loop sandals for everyday comfort.",
    featured: true,
  },
  {
    id: "p10",
    slug: "womens-clear-block-heel-sandals",
    name: "Women’s Clear Block-Heel Sandals",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: "womens",
    price: 1900,
    oldPrice: 2400,
    stock: 11,
    images: ["/products/p10.jpg"],
    description: "Transparent cross-strap sandals with clear block heel.",
    featured: true,
  },
  {
    id: "p11",
    slug: "womens-fluffy-cross-strap-slippers",
    name: "Women’s Fluffy Cross-Strap Slippers",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: "womens",
    price: 900,
    stock: 30,
    images: ["/products/p11.jpg"],
    description: "Soft fluffy cross-strap slippers for home and travel.",
  },
  {
    id: "p12",
    slug: "womens-long-wallet-pom-pom",
    name: "Women’s Long Wallet with Pom pom",
    category: "fashion",
    subCategory: "Handbags & Wallets",
    gender: "womens",
    price: 1100,
    stock: 20,
    images: ["/products/p12.jpg"],
    description: "Long wallet with zipper and pom-pom charm.",
  },
  {
    id: "p22",
    slug: "spinning-exercise-bike",
    name: "Spinning Exercise Bike",
    category: "others",
    price: 24000,
    oldPrice: 28000,
    stock: 4,
    images: ["/products/p22.jpg"],
    description: "Home spinning exercise bike for cardio workouts.",
    flashDeal: true,
    featured: true,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string, gender?: "mens" | "womens") {
  return products.filter((p) => {
    if (p.category !== categorySlug) return false;
    if (gender && p.gender && p.gender !== gender) return false;
    return true;
  });
}

export function searchProducts(query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return products
    .filter((p) => {
      const hay = `${p.name} ${p.brand ?? ""} ${p.category} ${p.subCategory ?? ""}`.toLowerCase();
      return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
    })
    .slice(0, limit);
}
