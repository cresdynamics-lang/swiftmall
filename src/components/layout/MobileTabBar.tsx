"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/categories", label: "Categories", icon: "grid" },
  { href: "/deals", label: "Deals", icon: "bolt" },
  { href: "/account", label: "Account", icon: "user" },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();

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
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                  active ? "text-ink" : "text-ink/45"
                }`}
              >
                <TabIcon name={tab.icon} active={active} />
                {tab.label}
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
          <path
            d="M13 2L4 14h7l-1 8 10-14h-7l1-6z"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.8" />
          <path
            d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"
            stroke={stroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
