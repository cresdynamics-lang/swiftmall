"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";
import { MobileDrawer } from "./MobileDrawer";
import { MobileTabBar } from "./MobileTabBar";
import { Navbar } from "./Navbar";
import { TopStrip } from "./TopStrip";
import { WhatsAppFloat } from "./WhatsAppFloat";

export function SiteShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const checkoutMode = pathname.startsWith("/checkout");
  const adminMode = pathname.startsWith("/admin");

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
      <CategoryNav />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
