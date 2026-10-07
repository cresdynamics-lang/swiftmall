import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteShell } from "@/components/layout/SiteShell";
import { storeConfig } from "@/lib/store-config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${storeConfig.name} | ${storeConfig.tagline}`,
    template: `%s | ${storeConfig.name}`,
  },
  description:
    "Countrywide online store for health & beauty, home, electronics, phones, gifts and fashion. Shop · Pay · Delivered.",
  icons: {
    icon: storeConfig.logo.icon,
    apple: storeConfig.logo.icon,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
