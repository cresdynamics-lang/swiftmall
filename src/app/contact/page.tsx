import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { ContactForm } from "@/components/trust/ContactForm";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";
import { telHref, whatsappHref } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Contact | Swift Mall",
  description:
    "Talk to Swift Mall on WhatsApp, phone or email. We confirm every order with a real person.",
  robots: isTrustPageLive("contact") ? { index: true, follow: true } : { index: false, follow: false },
};

export default function ContactPage() {
  const address = confirmedValue(business.physicalAddress);
  const mapUrl = confirmedValue(business.mapUrl);
  const hours = confirmedValue(business.openingHours);
  const reply = confirmedValue(business.typicalReplyTime);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.brandName,
    url: business.url,
    email: business.email,
    telephone: `+254${business.phone.replace(/^0/, "")}`,
    logo: `${business.url}${business.logo.full}`,
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
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
          {hours ? <p className="mt-3">Hours: {hours}</p> : null}
          {reply ? <p>Typical reply time: {reply}</p> : null}
        </TrustSection>

        {address ? (
          <TrustSection title="Find us">
            <p>{address}</p>
            {mapUrl ? (
              <p>
                <a href={mapUrl} className="font-semibold underline" target="_blank" rel="noopener noreferrer">
                  Open map
                </a>
              </p>
            ) : null}
          </TrustSection>
        ) : null}

        <TrustSection title="Send a message">
          <ContactForm />
        </TrustSection>
      </TrustPageShell>
    </>
  );
}
