"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/categories", label: "Categories", icon: "grid" },
  { href: "/deals", label: "Deals", icon: "bolt" },
  { href: "/cart", label: "Cart", icon: "cart" },
  { href: "/account", label: "Account", icon: "user" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? "text-ink" : "text-ink/45"
                }`}
              >
                <TabIcon name={tab.icon} active={active} />
                {tab.label}
                {tab.icon === "cart" && (
                  <span className="absolute right-[18%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-ink">
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#0B0B0B" : "#0B0B0B66";
  switch (name) {
    case "home":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 10.5L12 4l8 6.5V20H4V10.5z" stroke={stroke} strokeWidth="1.8" />
        </svg>
      );
    case "grid":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="4" y="4" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" />
          <rect x="13" y="4" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" />
          <rect x="4" y="13" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" />
          <rect x="13" y="13" width="7" height="7" rx="1" stroke={stroke} strokeWidth="1.8" />
        </svg>
      );
    case "bolt":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "cart":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M7 7h14l-1.5 9h-11L7 7z" stroke={stroke} strokeWidth="1.8" />
          <path d="M7 7L6 4H3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.8" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}
