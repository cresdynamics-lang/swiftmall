import Link from "next/link";

const links = [
  { href: "/help/how-to-order", label: "How to order" },
  { href: "/help/delivery", label: "Delivery" },
  { href: "/help/payment", label: "Payment" },
  { href: "/help/returns", label: "Returns" },
  { href: "/help/terms", label: "Terms" },
  { href: "/help/privacy", label: "Privacy" },
  { href: "/track", label: "Track my order" },
];

export const metadata = { title: "Help" };

export default function HelpIndexPage() {
  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Help</h1>
      <ul className="mt-6 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-lg bg-white px-4 py-3 text-sm font-medium text-ink ring-1 ring-ink/8 hover:shadow-sm"
            >
              {l.label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
