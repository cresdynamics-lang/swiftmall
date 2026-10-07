import {
  PrismaClient,
  OfferTag,
  Gender,
  OrderStatus,
  PaymentMethod,
  PaymentState,
} from "@prisma/client";
import { SHOE_EU_SIZES, TEDDY_CM_SIZES } from "../src/lib/product-sizes";

const prisma = new PrismaClient();
const SHOE_SIZES = [...SHOE_EU_SIZES];
const TEDDY_SIZES = [...TEDDY_CM_SIZES];

const categories = [
  {
    slug: "health-and-beauty",
    name: "Health & Beauty",
    shortName: "Beauty",
    blurb: "Skin, hair and wellness picks, delivered countrywide.",
    sortOrder: 1,
  },
  {
    slug: "kitchen-and-home",
    name: "Kitchen & Home Appliances",
    shortName: "Kitchen",
    blurb: "Cook, brew and serve.",
    sortOrder: 2,
  },
  {
    slug: "electronics",
    name: "Electronics",
    shortName: "Electronics",
    blurb: "Screens, sound and car gear.",
    sortOrder: 3,
  },
  {
    slug: "phones-and-accessories",
    name: "Phones & Accessories",
    shortName: "Phones",
    blurb: "Handsets, earbuds and chargers.",
    sortOrder: 4,
  },
  {
    slug: "gifts-and-accessories",
    name: "Gifts & Accessories",
    shortName: "Gifts",
    blurb: "Flowers, jewellery and presents.",
    sortOrder: 5,
  },
  {
    slug: "fashion",
    name: "Fashion",
    shortName: "Fashion",
    blurb: "Men's and women's shoes, bags and more.",
    sortOrder: 6,
  },
  {
    slug: "others",
    name: "Others",
    shortName: "Others",
    blurb: "Fitness and everything else.",
    sortOrder: 7,
  },
];

type SeedProduct = {
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
  offerTag?: OfferTag;
  gender?: Gender;
  sizes?: string[];
};

const products: SeedProduct[] = [
  {
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
    offerTag: OfferTag.TODAY,
  },
  {
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
    offerTag: OfferTag.THIS_WEEK,
  },
  {
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
    offerTag: OfferTag.NEW,
  },
  {
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
    offerTag: OfferTag.TODAY,
  },
  {
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
    offerTag: OfferTag.TODAY,
  },
  {
    slug: "ceramic-cup-saucer-set-6",
    name: "Ceramic Cup & Saucer Set, 6 pieces",
    category: "kitchen-and-home",
    price: 2200,
    stock: 15,
    images: ["/products/p17.jpg"],
    description: "Modern white ceramic mugs with wave saucers - set of six.",
    featured: true,
    offerTag: OfferTag.NEW,
  },
  {
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
    slug: "skyworth-65-qled-google-tv",
    name: 'Skyworth 65" QLED Google TV',
    category: "electronics",
    brand: "Skyworth",
    price: 62000,
    oldPrice: 75000,
    stock: 3,
    images: ["/products/p20.jpg"],
    description: "65-inch QLED Google TV with smart apps and vivid colour.",
    flashDeal: true,
    offerTag: OfferTag.THIS_WEEK,
  },
  {
    slug: "samsung-galaxy-a06-smartphone",
    name: "Samsung Galaxy A06 Smartphone",
    category: "phones-and-accessories",
    brand: "Samsung",
    price: 12500,
    stock: 20,
    images: ["/products/p21.jpg"],
    description: "Samsung Galaxy A06 - dual camera, large display, everyday performance.",
    featured: true,
    offerTag: OfferTag.NEW,
  },
  {
    slug: "true-wireless-bluetooth-earbuds",
    name: "True Wireless Bluetooth Earbuds",
    category: "phones-and-accessories",
    price: 2400,
    stock: 25,
    images: ["/products/p22.jpg"],
    description: "Comfortable true wireless earbuds with charging case.",
    featured: true,
  },
  {
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
    slug: "giant-pink-teddy-bear-1m",
    name: "Giant Pink Teddy Bear, 1m",
    category: "gifts-and-accessories",
    price: 2800,
    stock: 6,
    images: ["/products/p14.jpg"],
    description: "Soft giant pink teddy with Love heart patch - ideal gift.",
    featured: true,
    sizes: TEDDY_SIZES,
  },
  {
    slug: "gold-pendant-necklace-black-stone",
    name: "Gold Pendant Necklace, Black Stone",
    category: "gifts-and-accessories",
    price: 1200,
    stock: 22,
    images: ["/products/p15.jpg"],
    description: "Gold-tone pendant necklace with black stone accent.",
  },
  {
    slug: "womens-watch-and-bracelet-set",
    name: "Women's Watch & Bracelet Set",
    category: "gifts-and-accessories",
    price: 1800,
    oldPrice: 2500,
    stock: 12,
    images: ["/products/p16.jpg"],
    description:
      "Rectangular green-dial watch with magnetic mesh strap, sold with a matching open bangle.",
    flashDeal: true,
    featured: true,
    offerTag: OfferTag.TODAY,
  },
  {
    slug: "mens-leather-monk-strap-shoes",
    name: "Men's Leather Monk-Strap Shoes",
    category: "fashion",
    subCategory: "Shoes",
    gender: Gender.MENS,
    price: 4800,
    oldPrice: 6000,
    stock: 8,
    images: ["/products/p07.jpg"],
    description: "Polished brown leather monk-strap brogues with brass buckle.",
    featured: true,
    offerTag: OfferTag.THIS_WEEK,
    sizes: SHOE_SIZES,
  },
  {
    slug: "mens-leather-oxford-shoes-brown",
    name: "Men's Leather Oxford Shoes, Brown",
    category: "fashion",
    subCategory: "Shoes",
    gender: Gender.MENS,
    price: 4500,
    stock: 10,
    images: ["/products/p09.jpg"],
    description: "Classic brown leather Oxford shoes for work and occasions.",
    sizes: SHOE_SIZES,
  },
  {
    slug: "womens-comfort-toe-loop-sandals",
    name: "Women's Comfort Toe-Loop Sandals",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: Gender.WOMENS,
    price: 1600,
    stock: 16,
    images: ["/products/p08.jpg"],
    description: "Black platform toe-loop sandals for everyday comfort.",
    featured: true,
    sizes: SHOE_SIZES,
  },
  {
    slug: "womens-clear-block-heel-sandals",
    name: "Women's Clear Block-Heel Sandals",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: Gender.WOMENS,
    price: 1900,
    oldPrice: 2400,
    stock: 11,
    images: ["/products/p10.jpg"],
    description: "Transparent cross-strap sandals with clear block heel.",
    featured: true,
    offerTag: OfferTag.TODAY,
    sizes: SHOE_SIZES,
  },
  {
    slug: "womens-fluffy-cross-strap-slippers",
    name: "Women's Fluffy Cross-Strap Slippers",
    category: "fashion",
    subCategory: "Shoes & Sandals",
    gender: Gender.WOMENS,
    price: 900,
    stock: 30,
    images: ["/products/p11.jpg"],
    description: "Soft fluffy cross-strap slippers for home and travel.",
    offerTag: OfferTag.NEW,
    sizes: SHOE_SIZES,
  },
  {
    slug: "womens-long-wallet-pom-pom",
    name: "Women's Long Wallet with Pom pom",
    category: "fashion",
    subCategory: "Handbags & Wallets",
    gender: Gender.WOMENS,
    price: 1100,
    stock: 20,
    images: ["/products/p12.jpg"],
    description: "Long wallet with zipper and pom-pom charm.",
  },
  {
    slug: "spinning-exercise-bike",
    name: "Spinning Exercise Bike",
    category: "others",
    price: 24000,
    oldPrice: 28000,
    stock: 4,
    images: ["/products/p24.jpg"],
    description: "Home spinning exercise bike for cardio workouts.",
    flashDeal: true,
    featured: true,
    offerTag: OfferTag.THIS_WEEK,
  },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        shortName: c.shortName,
        blurb: c.blurb,
        sortOrder: c.sortOrder,
      },
      create: c,
    });
  }

  const cats = await prisma.category.findMany();
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  for (const [i, p] of products.entries()) {
    const categoryId = bySlug[p.category];
    if (!categoryId) throw new Error(`Missing category ${p.category}`);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        brand: p.brand,
        subCategory: p.subCategory,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        images: p.images,
        flashDeal: p.flashDeal ?? false,
        featured: p.featured ?? false,
        offerTag: p.offerTag ?? OfferTag.NONE,
        gender: p.gender ?? null,
        sizes: p.sizes ?? [],
        categoryId,
        sortOrder: i,
        live: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        brand: p.brand,
        subCategory: p.subCategory,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        images: p.images,
        flashDeal: p.flashDeal ?? false,
        featured: p.featured ?? false,
        offerTag: p.offerTag ?? OfferTag.NONE,
        gender: p.gender ?? null,
        sizes: p.sizes ?? [],
        categoryId,
        sortOrder: i,
        live: true,
      },
    });
  }

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      shippingFlatKes: 250,
      depositShare: 0.5,
      payOnOrder: true,
      depositEnabled: true,
      cashOnDelivery: true,
      payOnDelivery: true,
      carriers: ["Guardian Angel Coach", "Easy Coach", "Ena Coach"],
      paybill: "880100",
      bankAccount: "9211670018",
      whatsappNumber: "0727383847",
      phoneNumber: "0727383847",
      contactEmail: "orders@swiftmall.co.ke",
    },
  });

  await prisma.orderCounter.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", next: 1048 },
  });

  const allProducts = await prisma.product.findMany();
  const pBySlug = Object.fromEntries(allProducts.map((p) => [p.slug, p]));
  const health = cats.find((c) => c.slug === "health-and-beauty");

  await prisma.homepageBanner.deleteMany();
  await prisma.homepageBanner.createMany({
    data: [
      {
        headline: "Glow up.",
        subheadline: "Pay on delivery.",
        copy: "Skincare, hair care and wellness, delivered countrywide for a flat KES 250.",
        ctaLabel: "Shop Health & Beauty →",
        categoryId: health?.id ?? null,
        tile1ProductId: pBySlug["3-in-1-breakfast-maker"]?.id ?? null,
        tile2ProductId: pBySlug["skyworth-65-qled-google-tv"]?.id ?? null,
        active: true,
        sortOrder: 0,
      },
      {
        headline: "Cook. Brew.",
        subheadline: "Serve.",
        copy: "Appliances that earn their spot on the counter. Flat KES 250 shipping.",
        ctaLabel: "Shop Kitchen & Home →",
        categoryId: cats.find((c) => c.slug === "kitchen-and-home")?.id ?? null,
        tile1ProductId: pBySlug["ceramic-cup-saucer-set-6"]?.id ?? null,
        tile2ProductId: pBySlug["3-in-1-breakfast-maker"]?.id ?? null,
        active: true,
        sortOrder: 1,
      },
    ],
  });

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const sampleCustomers = [
      { name: "Jane W.", phone: "0712345678", email: "jane@example.com", county: "Nairobi" },
      { name: "Peter O.", phone: "0723456789", email: "peter@example.com", county: "Kisumu" },
      { name: "Amina H.", phone: "0734567890", email: "amina@example.com", county: "Mombasa" },
      { name: "Brian K.", phone: "0745678901", email: "brian@example.com", county: "Nakuru" },
      { name: "Grace M.", phone: "0756789012", email: "grace@example.com", county: "Nairobi" },
      { name: "Daniel T.", phone: "0767890123", email: "daniel@example.com", county: "Eldoret" },
    ];

    for (const c of sampleCustomers) {
      await prisma.customer.upsert({
        where: { email: c.email },
        update: c,
        create: c,
      });
    }

    const jane = await prisma.customer.findUniqueOrThrow({ where: { email: "jane@example.com" } });
    const watch = pBySlug["womens-watch-and-bracelet-set"];
    const earbuds = pBySlug["true-wireless-bluetooth-earbuds"];
    const serum = pBySlug["licorice-root-facial-serum-30ml"];
    const shoes = pBySlug["mens-leather-monk-strap-shoes"];
    const lip = pBySlug["strawberry-moisturising-lip-balm"];
    const mask = pBySlug["black-mask-peel-off-cleansing-120g"];
    const phone = pBySlug["samsung-galaxy-a06-smartphone"];
    const oil = pBySlug["ginger-hair-growth-essential-oil-30ml"];
    const maker = pBySlug["3-in-1-breakfast-maker"];

    const samples: Array<{
      number: number;
      email: string;
      town: string;
      address: string;
      carrier: string | null;
      paymentMethod: PaymentMethod;
      paymentState: PaymentState;
      status: OrderStatus;
      depositPaid: number;
      items: { product: (typeof allProducts)[0] | undefined; qty: number }[];
    }> = [
      {
        number: 1042,
        email: "jane@example.com",
        town: "Kasarani",
        address: "Near stage",
        carrier: "to confirm",
        paymentMethod: PaymentMethod.PAY_ON_ORDER,
        paymentState: PaymentState.PAID,
        status: OrderStatus.NEW,
        depositPaid: 7700,
        items: [
          { product: watch, qty: 1 },
          { product: earbuds, qty: 2 },
          { product: serum, qty: 1 },
        ],
      },
      {
        number: 1041,
        email: "peter@example.com",
        town: "Milimani",
        address: "Estate gate",
        carrier: "Easy Coach",
        paymentMethod: PaymentMethod.DEPOSIT,
        paymentState: PaymentState.PART_PAID,
        status: OrderStatus.NEW,
        depositPaid: 2400,
        items: [{ product: shoes, qty: 1 }],
      },
      {
        number: 1040,
        email: "amina@example.com",
        town: "Nyali",
        address: "Apartment block",
        carrier: "Guardian Angel Coach",
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        paymentState: PaymentState.TO_COLLECT,
        status: OrderStatus.PACKED,
        depositPaid: 0,
        items: [
          { product: lip, qty: 2 },
          { product: mask, qty: 1 },
        ],
      },
      {
        number: 1039,
        email: "brian@example.com",
        town: "Section 58",
        address: "Office pick-up",
        carrier: "Ena Coach",
        paymentMethod: PaymentMethod.PAY_ON_ORDER,
        paymentState: PaymentState.PAID,
        status: OrderStatus.DISPATCHED,
        depositPaid: 12750,
        items: [{ product: phone, qty: 1 }],
      },
      {
        number: 1038,
        email: "grace@example.com",
        town: "Westlands",
        address: "Building lobby",
        carrier: "Local rider",
        paymentMethod: PaymentMethod.PAY_ON_DELIVERY,
        paymentState: PaymentState.TO_COLLECT,
        status: OrderStatus.DELIVERED,
        depositPaid: 0,
        items: [
          { product: oil, qty: 1 },
          { product: lip, qty: 1 },
        ],
      },
      {
        number: 1037,
        email: "daniel@example.com",
        town: "Town",
        address: "Bus terminus",
        carrier: "Easy Coach",
        paymentMethod: PaymentMethod.PAY_ON_ORDER,
        paymentState: PaymentState.PAID,
        status: OrderStatus.DELIVERED,
        depositPaid: 6750,
        items: [{ product: maker, qty: 1 }],
      },
    ];

    for (const s of samples) {
      const cust = await prisma.customer.findUniqueOrThrow({ where: { email: s.email } });
      const lines = s.items.filter((i) => i.product);
      const subtotal = lines.reduce((sum, i) => sum + (i.product!.price * i.qty), 0);
      const shipping = 250;
      const total = subtotal + shipping;
      await prisma.order.create({
        data: {
          number: s.number,
          customerId: cust.id,
          customerName: cust.name,
          phone: cust.phone,
          email: cust.email,
          county: cust.county ?? "Nairobi",
          town: s.town,
          address: s.address,
          carrier: s.carrier,
          paymentMethod: s.paymentMethod,
          paymentState: s.paymentState,
          status: s.status,
          subtotal,
          shipping,
          total,
          depositPaid: s.depositPaid || (s.paymentState === PaymentState.PAID ? total : 0),
          items: {
            create: lines.map((i) => ({
              productId: i.product!.id,
              name: i.product!.name,
              image: i.product!.images[0] ?? "/products/p01.jpg",
              unitPrice: i.product!.price,
              qty: i.qty,
            })),
          },
        },
      });
    }

    // keep jane referenced for lint/type unused check
    void jane;
  }

  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, settings, banners and sample orders.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
