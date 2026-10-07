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
    default: `${storeConfig.name} | ${storeConfig.tagline}`,
    template: `%s | ${storeConfig.name}`,
  },
  description:
    "Countrywide online store for health & beauty, home, electronics, phones, gifts and fashion. Shop · Pay · Delivered on swiftmall.co.ke.",
  icons: {
    icon: storeConfig.logo.icon,
    apple: storeConfig.logo.icon,
  },
  metadataBase: new URL(`https://${storeConfig.domain}`),
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
