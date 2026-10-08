"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useSaved } from "@/context/SavedContext";
import { QUICK_SEARCH_LINKS } from "@/lib/hero-slides";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";

type NavbarProps = {
  onOpenMenu?: () => void;
};

export function Navbar({ onOpenMenu }: NavbarProps) {
  const { itemCount, openDrawer } = useCart();
  const { count: savedCount } = useSaved();
  const [bump, setBump] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!ready || itemCount === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [itemCount, ready]);

  const countLabel = ready ? itemCount : 0;

  return (
    <header className="sticky top-0 z-50 bg-ink text-white shadow-md">
      <div className="relative mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <Logo className="max-w-[120px] shrink-0 sm:max-w-[160px] lg:max-w-none" />

        {/* Desktop / tablet search */}
        <div className="hidden min-w-0 flex-1 flex-col gap-1 md:flex">
          <SearchBox className="min-w-0 w-full" />
          <div className="hidden flex-wrap gap-x-3 gap-y-0.5 px-0.5 text-[11px] text-white/55 lg:flex">
            {QUICK_SEARCH_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-brand">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/account"
            className="rounded-md px-2.5 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Account
          </Link>
          <Link
            href="/saved"
            className="relative rounded-md px-2.5 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Saved
            {savedCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-ink">
                {savedCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            className={`relative rounded-md p-2 text-white hover:bg-white/10 ${
              bump ? "scale-105" : ""
            } transition`}
            aria-label={`Open cart, ${countLabel} items`}
          >
            <CartIcon />
            <span
              className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-ink ${
                bump ? "animate-pulse" : ""
              }`}
            >
              {countLabel}
            </span>
          </button>
        </nav>

        {/* Phone: search icon + cart + menu */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:hidden">
          <SearchBox className="shrink-0" />
          <button
            type="button"
            onClick={openDrawer}
            className={`relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 ${
              bump ? "scale-105" : ""
            } transition`}
            aria-label={`Cart, ${countLabel} items`}
          >
            <CartIcon />
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold leading-none text-ink">
              {countLabel}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onOpenMenu?.()}
            className="flex h-10 w-10 items-center justify-center rounded-md text-white/90 hover:bg-white/10"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 7h14l-1.5 9h-11L7 7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M7 7L6 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}
