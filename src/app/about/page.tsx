import type { Metadata } from "next";
import { TrustPageShell, TrustSection } from "@/components/trust/TrustPageShell";
import { business, confirmedValue, isTrustPageLive } from "@/lib/business";

/** Unlinked / noindex until city, legal name and owner details are confirmed. */
export const metadata: Metadata = {
  title: "About | Swift Mall",
  description:
    "Swift Mall is a Kenyan online shop for beauty, home, electronics, phones, gifts and fashion. Pay on delivery. Countrywide delivery.",
  robots: isTrustPageLive("about")
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export default function AboutPage() {
  const city = confirmedValue(business.city);
  const legal = confirmedValue(business.legalName);
  const reg = confirmedValue(business.registrationNumber);
  const address = confirmedValue(business.physicalAddress);
  const hours = confirmedValue(business.openingHours);
  const ownerName = confirmedValue(business.owner.name);
  const ownerRole = confirmedValue(business.owner.role);
  const ownerPhoto = confirmedValue(business.owner.photo);

  return (
    <TrustPageShell
      title="Swift Mall: a Kenyan shop you can call."
      summary="A small online shop with a real person behind every order."
    >
      <TrustSection title="Who we are">
        <p>
          Swift Mall is an online shop
          {city ? ` based in ${city}` : ""}. We sell health and beauty, kitchen and home
          appliances, electronics, phones, gifts and fashion, and we deliver countrywide.
        </p>
      </TrustSection>

      <TrustSection title="How we work">
        <p>
          Every order is confirmed by a real person on call or WhatsApp before it leaves us. You
          can pay on delivery, so you see the item before you pay.
        </p>
      </TrustSection>

      <TrustSection title="What we sell">
        <ul className="list-disc space-y-1 pl-5">
          {business.departments.map((d) => (
            <li key={d.slug}>
              <strong>{d.name}</strong> — {d.blurb}
            </li>
          ))}
        </ul>
      </TrustSection>

      {ownerName && ownerRole ? (
        <TrustSection title="Who is behind Swift Mall">
          <p>
            {ownerName}, {ownerRole}.
          </p>
          {ownerPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ownerPhoto} alt={ownerName} className="mt-3 max-w-xs rounded-lg" />
          ) : null}
        </TrustSection>
      ) : null}

      <TrustSection title="Find us">
        {legal || reg ? (
          <p>
            {legal ? <>Registered name: {legal}. </> : null}
            {reg ? <>Registration: {reg}.</> : null}
          </p>
        ) : null}
        {address ? <p>{address}</p> : null}
        <p>
          Phone / WhatsApp: {business.phone}. Email: {business.email}.
        </p>
        {hours ? <p>Hours: {hours}</p> : null}
      </TrustSection>
    </TrustPageShell>
  );
}
