"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { discountPercent, formatKes } from "@/lib/format";
import {
  HERO_CROSSFADE_MS,
  HERO_MANUAL_PAUSE_MS,
  HERO_SLIDE_MS,
  type HeroSlideDef,
  type HeroTheme,
} from "@/lib/hero-slides";

export type CampaignProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
};

export type CampaignSlide = HeroSlideDef & {
  products: CampaignProduct[];
};

const THEME: Record<
  HeroTheme,
  { bg: string; text: string; accent: string; pill: string; bubble: string; btn: string }
> = {
  night: {
    bg: "bg-ink",
    text: "text-white",
    accent: "text-brand",
    pill: "border-brand bg-white text-ink",
    bubble: "bg-brand text-ink",
    btn: "bg-brand text-ink hover:bg-brand-dark",
  },
  sun: {
    bg: "bg-brand",
    text: "text-ink",
    accent: "text-ink",
    pill: "border-ink bg-ink text-white",
    bubble: "bg-brand text-ink ring-2 ring-white",
    btn: "bg-ink text-white hover:bg-ink/90",
  },
  paper: {
    bg: "bg-[#F5F5F5]",
    text: "text-ink",
    accent: "text-ink",
    pill: "border-brand bg-white text-ink",
    bubble: "bg-ink text-brand",
    btn: "bg-brand text-ink hover:bg-brand-dark",
  },
};

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersDataSaver() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

export function CampaignHero({
  slides,
  onIndexChange,
}: {
  slides: CampaignSlide[];
  onIndexChange?: (index: number) => void;
}) {
  const safe = slides.filter((s) => s.products.length >= 1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [manualHoldUntil, setManualHoldUntil] = useState(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const regionRef = useRef<HTMLElement>(null);

  const active = safe[index] ?? safe[0];
  const n = safe.length;

  const goTo = useCallback(
    (i: number, manual = false) => {
      if (!n) return;
      const next = ((i % n) + n) % n;
      setIndex(next);
      onIndexChange?.(next);
      startRef.current = performance.now();
      elapsedRef.current = 0;
      if (manual) setManualHoldUntil(Date.now() + HERO_MANUAL_PAUSE_MS);
    },
    [n, onIndexChange],
  );

  useEffect(() => {
    onIndexChange?.(index);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- sync initial

  useEffect(() => {
    setReduced(prefersReducedMotion());
    setDataSaver(prefersDataSaver());
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!n || reduced || dataSaver || !ready) return;
    const tick = (now: number) => {
      const held = Date.now() < manualHoldUntil;
      const el = regionRef.current;
      let offscreen = false;
      if (el) {
        const r = el.getBoundingClientRect();
        const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        offscreen = visible < r.height * 0.25;
      }
      const hidden = document.visibilityState === "hidden";
      const stop = paused || held || offscreen || hidden;
      if (!stop) {
        if (!startRef.current) startRef.current = now - elapsedRef.current;
        const elapsed = now - startRef.current;
        elapsedRef.current = elapsed;
        if (elapsed >= HERO_SLIDE_MS) goTo(index + 1);
      } else {
        startRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [n, reduced, dataSaver, ready, paused, manualHoldUntil, index, goTo]);

  function onKey(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1, true);
    }
  }

  if (!active) return null;
  const showMotion = !reduced && !dataSaver;

  return (
    <section
      ref={regionRef}
      aria-label="Featured departments"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative h-full outline-none"
    >
      {/*
        Mobile: content-driven height. Tablet: aspect canvas.
        Desktop: fill remaining viewport (parent sets height).
      */}
      <div className="relative h-full min-h-[280px] overflow-hidden rounded-[14px] md:min-h-[380px] lg:min-h-0 lg:rounded-2xl">
        {/* Mobile height sizer */}
        <div
          aria-hidden
          className="invisible pointer-events-none p-4 md:hidden"
        >
          <p className="text-[10px] font-semibold tracking-[0.2em]">{active.eyebrow}</p>
          <h2 className="mt-1.5 font-display text-[1.55rem] font-bold leading-[1.08]">
            {active.headline}
            <br />
            {active.headlineAccent}
          </h2>
          <p className="mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold">
            {active.tagline}
          </p>
          <div className="mt-4 h-12 w-full rounded-md" />
        </div>

        {safe.map((slide, i) => {
          const on = i === index;
          const t = THEME[slide.theme];
          const circleProducts = slide.products.slice(0, 3);
          return (
            <article
              key={slide.id}
              aria-hidden={!on}
              className={`absolute inset-0 ${t.bg} ${t.text}`}
              style={{
                opacity: on ? 1 : 0,
                transition: showMotion ? `opacity ${HERO_CROSSFADE_MS}ms ease` : "none",
                pointerEvents: on ? "auto" : "none",
                zIndex: on ? 2 : 1,
              }}
            >
              <SlideBackdrop slide={slide} active={on && showMotion} />
              <div className="relative z-10 flex h-full flex-col justify-center gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-8 lg:gap-8 lg:px-14 lg:py-10 xl:px-16">
                <div className="flex max-w-xl shrink-0 flex-col justify-center md:max-w-[42%] lg:max-w-[38%]">
                  <p className={`text-[10px] font-semibold tracking-[0.2em] lg:text-xs ${t.accent}`}>
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-1.5 font-display text-[1.55rem] font-bold leading-[1.08] sm:text-[1.85rem] md:text-[2.2rem] lg:text-[3rem] xl:text-[3.4rem]">
                    <span className={showMotion && on ? "hero-rise" : ""}>{slide.headline}</span>
                    <br />
                    <span
                      className={`${slide.theme === "night" ? "text-brand" : t.accent} ${
                        showMotion && on ? "hero-rise hero-rise-delay" : ""
                      }`}
                    >
                      {slide.headlineAccent}
                    </span>
                  </h2>
                  <p
                    className={`mt-3 inline-flex max-w-full rounded-full border px-3 py-1.5 text-xs font-semibold sm:text-sm ${t.pill} ${
                      showMotion && on ? "hero-fade" : ""
                    }`}
                  >
                    {slide.tagline}
                  </p>
                  <div className={showMotion && on ? "hero-fade hero-fade-delay" : ""}>
                    <Link
                      href={slide.ctaHref}
                      className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold sm:w-fit lg:min-h-12 lg:px-6 lg:text-base ${t.btn}`}
                    >
                      {slide.ctaLabel}
                    </Link>
                  </div>
                </div>

                {/* Up to 3 circular product pills with price tags — change with each slide */}
                {circleProducts.length > 0 ? (
                  <div
                    className={`hidden items-end justify-end gap-3 md:flex md:flex-1 lg:gap-5 ${
                      showMotion && on ? "hero-tiles-in" : ""
                    }`}
                  >
                    {circleProducts.map((p, pi) => (
                      <CircleProduct
                        key={p.id}
                        product={p}
                        theme={slide.theme}
                        size={pi === 1 ? "lg" : "md"}
                        rotate={pi === 0 ? -6 : pi === 1 ? 2 : -3}
                        animate={showMotion && on}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {/* Arrows — tablet/desktop only, inset so they don't cover copy */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => goTo(index - 1, true)}
        className="absolute left-1.5 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/45 text-lg text-white hover:bg-brand hover:text-ink md:flex lg:left-2 lg:h-10 lg:w-10"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => goTo(index + 1, true)}
        className="absolute right-1.5 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/45 text-lg text-white hover:bg-brand hover:text-ink md:flex lg:right-2 lg:h-10 lg:w-10"
      >
        ›
      </button>

    </section>
  );
}

function SlideBackdrop({
  slide,
  active,
}: {
  slide: CampaignSlide;
  active: boolean;
}) {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-8 top-6 h-40 w-40 rounded-full bg-black opacity-20 mix-blend-multiply" />
        <div className="absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-black opacity-15" />
        <div
          className="absolute -left-10 bottom-10 h-32 w-56 -rotate-12 opacity-10"
          style={{
            background:
              "repeating-linear-gradient(-45deg, transparent, transparent 8px, currentColor 8px, currentColor 10px)",
          }}
        />
      </div>
      {slide.background && slide.backgroundShape !== "none" ? (
        <div
          className={`absolute inset-y-0 right-0 ${
            slide.backgroundShape === "circle"
              ? "right-[2%] top-1/2 hidden h-[70%] w-[58%] max-w-[520px] -translate-y-1/2 overflow-hidden rounded-full md:block"
              : "hidden w-[58%] md:block lg:w-[62%]"
          }`}
          style={
            active && slide.backgroundShape === "side"
              ? { animation: "hero-zoom 4s linear forwards" }
              : undefined
          }
        >
          {slide.imageSrcSet ? (
            <picture className="absolute inset-0 block h-full w-full">
              <source type="image/webp" srcSet={slide.imageSrcSet.webp} sizes="55vw" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.background}
                alt=""
                className={`h-full w-full object-cover ${
                  slide.theme === "night"
                    ? "brightness-[0.65]"
                    : slide.theme === "paper"
                      ? "brightness-110"
                      : ""
                }`}
                style={{ objectPosition: slide.focal }}
              />
            </picture>
          ) : (
            <Image
              src={slide.background}
              alt=""
              fill
              className={`object-cover ${
                slide.theme === "night" ? "brightness-[0.65]" : ""
              }`}
              sizes="55vw"
            />
          )}
          {slide.backgroundShape === "side" ? (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  slide.theme === "sun"
                    ? "linear-gradient(to right, #FFC400 0%, rgba(255,196,0,0.7) 35%, transparent 70%)"
                    : slide.theme === "paper"
                      ? "linear-gradient(to right, #F5F5F5 0%, rgba(245,245,245,0.85) 40%, transparent 75%)"
                      : "linear-gradient(to right, #0B0B0B 0%, rgba(11,11,11,0.85) 40%, transparent 75%)",
              }}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/** Circular product with price bubble — used in hero (and phone rail) */
export function CircleProduct({
  product,
  theme,
  size = "md",
  rotate = 0,
  animate = false,
}: {
  product: CampaignProduct;
  theme: HeroTheme;
  size?: "sm" | "md" | "lg";
  rotate?: number;
  animate?: boolean;
}) {
  const t = THEME[theme];
  const pct = discountPercent(product.price, product.oldPrice);
  const dim =
    size === "lg"
      ? "h-[148px] w-[148px] lg:h-[180px] lg:w-[180px]"
      : size === "sm"
        ? "h-[100px] w-[100px]"
        : "h-[120px] w-[120px] lg:h-[150px] lg:w-[150px]";
  const bubble =
    size === "lg"
      ? "h-[68px] w-[68px] lg:h-[78px] lg:w-[78px] text-[11px] lg:text-sm"
      : size === "sm"
        ? "h-[52px] w-[52px] text-[9px]"
        : "h-[58px] w-[58px] lg:h-[68px] lg:w-[68px] text-[10px] lg:text-[11px]";

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`relative shrink-0 ${animate ? "hero-float-tile" : ""}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label={`${product.name}, ${formatKes(product.price)}`}
    >
      <span
        className={`relative block overflow-hidden rounded-full bg-white shadow-xl ring-4 ring-white/80 ${dim}`}
      >
        <Image
          src={product.image}
          alt=""
          fill
          className="object-contain p-3"
          sizes="180px"
        />
      </span>
      <span
        className={`absolute -bottom-1 -right-1 flex flex-col items-center justify-center rounded-full text-center shadow-md ring-2 ring-white ${bubble} ${t.bubble} ${
          animate ? "hero-bubble-in" : ""
        }`}
      >
        <span className="text-[7px] font-semibold leading-none opacity-80 lg:text-[8px]">KES</span>
        <span className="font-bold leading-tight">
          {product.price.toLocaleString("en-KE")}
        </span>
        {product.oldPrice && pct != null ? (
          <span className="text-[7px] line-through opacity-65 lg:text-[8px]">
            {product.oldPrice.toLocaleString("en-KE")}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/** @deprecated kept for any remaining callers — prefer CircleProduct */
export function HeroOfferCards({ products }: { products: CampaignProduct[] }) {
  return (
    <div className="flex items-center gap-3">
      {products.slice(0, 3).map((p, i) => (
        <CircleProduct key={p.id} product={p} theme="sun" size={i === 1 ? "lg" : "md"} />
      ))}
    </div>
  );
}
