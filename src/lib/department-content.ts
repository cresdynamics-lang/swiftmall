/**
 * Draft department intros and buying guides for owner approval.
 * Keep draft: true until approved — pages should not surface unapproved copy as final SEO content without review.
 */
export type DepartmentContent = {
  slug: string;
  h1: string;
  intro: string;
  buyingGuide: string;
  draft: boolean;
};

export const departmentContent: DepartmentContent[] = [
  {
    slug: "health-and-beauty",
    h1: "Health & Beauty in Kenya",
    intro:
      "Shop skin, hair and wellness picks at Swift Mall. Browse what is in stock, add to cart, and choose pay on delivery if you want to see the item first. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "Start with what you need most — everyday skincare, hair care or a small wellness item. Check the product page for size and stock. If you are unsure, WhatsApp us with the product name and we will help you pick. Pay on delivery is available on most orders.",
    draft: true,
  },
  {
    slug: "kitchen-and-home",
    h1: "Kitchen & Home Appliances in Kenya",
    intro:
      "Cook, brew and serve with kitchen and home appliances from Swift Mall. See live stock and prices on each card. Pay on delivery. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "Match the appliance to your space and power needs. Read the product description for what is in the box. For large items, confirm your delivery area on WhatsApp before you pay a deposit or pay now.",
    draft: true,
  },
  {
    slug: "electronics",
    h1: "Electronics in Kenya",
    intro:
      "Find screens, sound and car electronics at Swift Mall. Prices are shown in KES with stock from our catalogue. Pay on delivery. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "Compare screen size, features and stock before you buy. Use the product page for the short description we have. Ask on WhatsApp if you need help choosing between two items.",
    draft: true,
  },
  {
    slug: "phones-and-accessories",
    h1: "Phones & Accessories in Kenya",
    intro:
      "Handsets, earbuds and chargers from Swift Mall. Check the live price and stock on each product. Pay on delivery. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "For phones, confirm the model name on the product page. For earbuds and chargers, check compatibility notes in the description. Message us on WhatsApp if you want to confirm before checkout.",
    draft: true,
  },
  {
    slug: "gifts-and-accessories",
    h1: "Gifts & Accessories in Kenya",
    intro:
      "Flowers, jewellery and gift picks at Swift Mall. Browse what is available now and order for delivery. Pay on delivery. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "Choose by occasion and budget shown on the product cards. For flowers and fresh gifts, confirm timing with us on WhatsApp after you order so we can plan delivery.",
    draft: true,
  },
  {
    slug: "fashion",
    h1: "Fashion in Kenya",
    intro:
      "Shoes, bags and fashion pieces at Swift Mall. Pick a size when the product asks for one. Pay on delivery. Flat KES 250 delivery countrywide.",
    buyingGuide:
      "Use the size options on the product page when they appear. If you are between sizes, WhatsApp us with your usual size before you order. Check the item when it arrives if you chose pay on delivery.",
    draft: true,
  },
];

export function getDepartmentContent(slug: string) {
  return departmentContent.find((d) => d.slug === slug) ?? null;
}
