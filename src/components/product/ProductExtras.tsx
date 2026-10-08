"use client";

import Link from "next/link";
import { PRODUCT_GRID_CLASS, ProductCard } from "@/components/product/ProductCard";
import { useViewed } from "@/context/ViewedContext";
import { storeConfig, whatsappHref } from "@/lib/store-config";
import type { Category } from "@/lib/categories";
import type { Product } from "@/lib/product-types";

export function ProductWhatsAppOrder({
  productName,
  priceLabel,
}: {
  productName: string;
  priceLabel: string;
}) {
  const msg = `Hi Swiftmall, I'd like to order: ${productName} (${priceLabel})`;
  return (
    <a
      href={whatsappHref(msg)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-110"
    >
      <WhatsAppIcon />
      Order via WhatsApp · {storeConfig.whatsappNumber}
    </a>
  );
}

export function ProductRecentlyViewed({ excludeId }: { excludeId: string }) {
  const { items } = useViewed();
  const list = items.filter((p) => p.id !== excludeId).slice(0, 4);
  if (!list.length) return null;

  return (
    <ProductRail title="Recently viewed" products={list} />
  );
}

export function ProductRail({
  title,
  products,
  seeAllHref,
}: {
  title: string;
  products: Product[];
  seeAllHref?: string;
}) {
  if (!products.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-2">
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {seeAllHref ? (
          <Link href={seeAllHref} className="text-sm font-semibold text-ink hover:underline">
            See all →
          </Link>
        ) : null}
      </div>
      <div className={PRODUCT_GRID_CLASS}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function ShopOtherDepartments({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug: string;
}) {
  const list = categories.filter((c) => c.slug !== currentSlug && c.slug !== "others");
  if (!list.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-xl font-bold text-ink">Shop other departments</h2>
      <div className="flex flex-wrap gap-2">
        {list.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="rounded-full bg-ink/[0.05] px-3.5 py-2 text-sm font-semibold text-ink hover:bg-brand"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.82c0 1.96.52 3.82 1.5 5.46L2 22l4.9-1.58a10 10 0 0 0 5.14 1.4h.01c5.46 0 9.89-4.4 9.89-9.82S17.5 2 12.04 2zm5.76 13.96c-.24.68-1.4 1.24-1.93 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.78-4.17-4.93-4.36-.14-.2-1.2-1.6-1.2-3.05 0-1.46.76-2.18 1.03-2.47.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.24.6.82 2.07.89 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.14.17-.3.38-.43.51-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.44.12.60-.07.17-.2.7-.81.89-1.09.18-.28.37-.23.62-.14.25.1 1.58.75 1.85.88.27.14.45.2.52.31.07.11.07.64-.17 1.32z" />
    </svg>
  );
}
