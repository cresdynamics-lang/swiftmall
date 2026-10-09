"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adminLogout } from "@/app/management/actions";
import { Logo } from "@/components/layout/Logo";
import { storeConfig } from "@/lib/store-config";

const nav = [
  { href: "/management", label: "Dashboard", exact: true },
  { href: "/management/orders", label: "Orders" },
  { href: "/management/products", label: "Products" },
  { href: "/management/categories", label: "Categories" },
  { href: "/management/banners", label: "Homepage banners" },
  { href: "/management/customers", label: "Customers" },
  { href: "/management/payments", label: "Payments & shipping" },
  { href: "/management/reports", label: "Reports" },
  { href: "/management/settings", label: "Settings" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      {nav.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-md px-3 py-2 text-sm transition ${
              active
                ? "bg-brand font-semibold text-ink"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isLogin = pathname === "/management/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f3f3] text-ink">
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col bg-ink text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <Logo />
          <p className="mt-2 text-[11px] text-white/45">{storeConfig.domain}/management</p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>

        <div className="border-t border-white/10 px-4 py-4 text-[11px] text-white/55">
          <p className="font-medium text-white/80">Signed in as Martin</p>
          <p className="mt-1">Owner · full access</p>
          <div className="mt-3 flex flex-col gap-1.5">
            <Link href="/" className="text-white/70 hover:text-brand">
              View store →
            </Link>
            <form action={adminLogout}>
              <button type="submit" className="text-left text-white/70 hover:text-brand">
                Log out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/10 bg-ink px-4 py-3 text-white md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded bg-white/10 px-3 py-1.5 text-sm font-semibold"
          >
            Menu
          </button>
          <p className="font-display text-sm font-bold">{storeConfig.adminTitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
