"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatKes, offerTagLabel } from "@/lib/format";

export type HeroSlide = {
  id: string;
  department: string;
  href: string;
  headline: string;
  sub: string;
  copy: string;
  cta: string;
  tiles: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    oldPrice?: number | null;
    image: string;
    offerTag: "NONE" | "TODAY" | "THIS_WEEK" | "NEW";
  }>;
};

export function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const safeSlides = slides.length
    ? slides
    : [
        {
          id: "fallback",
          department: "Swiftmall",
          href: "/deals",
          headline: "Shop it.",
          sub: "Pay it. Get it.",
          copy: "Countrywide delivery for a flat shipping fee.",
          cta: "Browse deals →",
          tiles: [],
        },
      ];

  useEffect(() => {
    if (safeSlides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % safeSlides.length), 3000);
    return () => clearInterval(id);
  }, [safeSlides.length]);

  const slide = safeSlides[index] ?? safeSlides[0];

  return (
    <section className="mx-auto grid max-w-7xl gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
      <div className="relative min-h-[240px] overflow-hidden rounded-xl bg-ink text-white sm:min-h-[320px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,196,0,0.28),_transparent_55%)]" />
        <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            {slide.department}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] sm:text-5xl">
            {slide.headline}
            <br />
            <span className="text-brand">{slide.sub}</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/70 sm:text-base">{slide.copy}</p>
          <Link
            href={slide.href}
            className="mt-5 inline-flex w-fit rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            {slide.cta}
          </Link>
        </div>
        {safeSlides.length > 1 ? (
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {safeSlides.map((_, i) => (
              <button
                key={safeSlides[i].id}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition ${
                  i === index ? "w-6 bg-brand" : "w-1.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
        {slide.tiles.map((product) => {
          const tag =
            offerTagLabel({
              price: product.price,
              oldPrice: product.oldPrice ?? undefined,
              offerTag: product.offerTag,
            }) ?? "Featured";
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex min-h-[140px] items-stretch gap-3 overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition hover:shadow-md"
            >
              <div className="relative w-[42%] shrink-0 sm:w-36 lg:w-[45%]">
                <Image src={product.image} alt="" fill className="object-cover" sizes="180px" />
              </div>
              <div className="flex flex-1 flex-col justify-center py-3 pr-3">
                <span className="w-fit rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
                  {tag}
                </span>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-ink">{product.name}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">
                  {formatKes(product.price)}
                  {product.oldPrice ? (
                    <span className="ml-2 text-xs font-normal text-ink/40 line-through">
                      {formatKes(product.oldPrice)}
                    </span>
                  ) : null}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
