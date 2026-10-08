"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BackToTop } from "./BackToTop";
import { Footer } from "./Footer";
import { MarketNavStrip } from "./MarketNavStrip";
import { MobileDrawer } from "./MobileDrawer";
import { MobileTabBar } from "./MobileTabBar";
import { Navbar } from "./Navbar";
import { TopStrip } from "./TopStrip";
import { TawkChat } from "./TawkChat";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const checkoutMode = pathname.startsWith("/checkout");
  const adminMode = pathname.startsWith("/management");

  if (adminMode) {
    return <>{children}</>;
  }

  if (checkoutMode) {
    return (
      <>
        {children}
        <CartDrawer />
      </>
    );
  }

  return (
    <>
      <TopStrip />
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <MarketNavStrip />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="min-w-0 flex-1 overflow-x-clip pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
      {process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ? <TawkChat /> : <WhatsAppFloat />}
      <BackToTop />
      <CartDrawer />
    </>
  );
}
