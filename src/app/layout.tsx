import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteShell } from "@/components/layout/SiteShell";
import { listStoreCategories } from "@/lib/categories-db";
import { listLiveProducts } from "@/lib/products";
import { getStoreSettings } from "@/lib/settings";
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
    default: "Swift Mall | Online Shop Kenya: Beauty, Electronics, Phones, Home",
    template: `%s | Swift Mall`,
  },
  description:
    "Shop health & beauty, kitchen appliances, electronics, phones, gifts and fashion online in Kenya. Pay on delivery. Countrywide delivery at a flat KES 250.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/brand/logo-icon.jpg",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL(`https://${storeConfig.domain}`),
  openGraph: {
    type: "website",
    siteName: "Swift Mall",
    locale: "en_KE",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [products, settings, categories] = await Promise.all([
    listLiveProducts(),
    getStoreSettings(),
    listStoreCategories(),
  ]);

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers products={products} settings={settings} categories={categories}>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
