import Link from "next/link";
import { notFound } from "next/navigation";
import { storeConfig } from "@/lib/store-config";

const pages: Record<string, { title: string; body: string[] }> = {
  delivery: {
    title: "Delivery",
    body: [
      `We deliver countrywide for a flat KES ${storeConfig.shippingFlatKes}.`,
      "Enter your county, town and address at checkout. We arrange shipping and will contact you on WhatsApp or phone with delivery updates.",
    ],
  },
  returns: {
    title: "Returns",
    body: [
      "Return or exchange rules will be confirmed with the store owner before launch.",
      "Contact us on WhatsApp with your order number if an item arrives damaged.",
    ],
  },
  terms: {
    title: "Terms",
    body: [
      "By placing an order you agree that we may contact you about that order for delivery and payment.",
      "Product names and prices on sample listings may change; the cart total at checkout is what you pay.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "Your details are used only for delivery and order communication, in line with the Kenya Data Protection Act.",
      "We do not sell customer data.",
    ],
  },
  payment: {
    title: "Payment",
    body: [
      "Three options at checkout: Pay a deposit, Pay now, or Cash on delivery.",
      `Pay now / deposit: M-Pesa → Lipa na M-Pesa → Pay Bill → Business number ${storeConfig.payments.paybill}, account ${storeConfig.payments.bankAccount}. WhatsApp / call ${storeConfig.whatsappNumber}.`,
    ],
  },
  "how-to-order": {
    title: "How to order",
    body: [
      "Browse, tap Add to Cart, then open the cart when you are ready.",
      "Choose Proceed to Order, enter your delivery details, pick Pay a deposit, Pay now, or Cash on delivery, then submit.",
    ],
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: pages[slug]?.title ?? "Help" };
}

export default async function HelpPage({ params }: PageProps) {
  const { slug } = await params;
  const page = pages[slug];
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-2xl px-3 py-10 sm:px-4">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Home
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold text-ink">{page.title}</h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
