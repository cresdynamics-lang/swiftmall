import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { ContactForm } from "@/components/trust/ContactForm";
import {
  business,
  confirmedValue,
  isTrustPageLive,
  shopAddressDisplay,
  shopHoursDisplay,
} from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Contact | Swift Mall",
  description:
    "Talk to Swift Mall on WhatsApp, phone or email. Visit us in Nairobi or order for delivery.",
  robots: isTrustPageLive("contact")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function ContactPage() {
  const mapUrl = confirmedValue(business.shop.mapUrl);
  const gmb = confirmedValue(business.shop.googleBusinessUrl);
  const reply = confirmedValue(business.typicalReplyTime);
  const sameAs = [gmb].filter(Boolean) as string[];

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.brandName,
    url: business.url,
    email: business.email,
    telephone: `+254${business.phone.replace(/^0/, "")}`,
    logo: `${business.url}${business.logo.full}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: shopAddressDisplay(),
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    openingHours: shopHoursDisplay(),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
      />
      <TrustPageShell
        title="Talk to a person."
        summary="WhatsApp, call or email — we confirm every order before dispatch."
      >
        <TrustSection title="Reach us">
          <div className="grid gap-2">
            <a
              href={whatsappHref("Hi Swift Mall, I need help.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center rounded-md bg-[#25D366] px-4 text-sm font-semibold text-white"
            >
              WhatsApp {business.whatsapp}
            </a>
            <a
              href={telHref()}
              className="flex min-h-12 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white"
            >
              Call {business.phone}
            </a>
            <a
              href={`mailto:${business.email}`}
              className="flex min-h-12 items-center justify-center rounded-md border border-ink/15 bg-white px-4 text-sm font-semibold text-ink"
            >
              Email {business.email}
            </a>
          </div>
          <p className="mt-3">Hours: {shopHoursDisplay()}</p>
          {reply ? <p>Typical reply time: {reply}</p> : null}
        </TrustSection>

        <TrustSection title="Find us">
          <p>{shopAddressDisplay()}</p>
          <p className="mt-1 text-sm text-ink/70">{business.pickup.afterHoursNote}</p>
          {mapUrl ? (
            <p className="mt-2">
              <a
                href={mapUrl}
                className="font-semibold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
            </p>
          ) : null}
          {gmb ? (
            <p className="mt-2">
              <a
                href={gmb}
                className="font-semibold underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Find us on Google
              </a>
            </p>
          ) : null}
        </TrustSection>

        <TrustSection title="Send a message">
          <ContactForm />
        </TrustSection>
      </TrustPageShell>
    </>
  );
}
