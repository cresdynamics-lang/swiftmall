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
      <div className="relative h-full overflow-hidden rounded-[14px] md:min-h-[340px] md:aspect-[16/7] lg:aspect-auto lg:min-h-0">
        {/* Mobile height sizer — mirrors active slide copy so the box grows with content */}
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
              <div className="relative z-10 flex h-full flex-col justify-center gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-12 lg:gap-5 lg:px-14 lg:py-8">
                <div className="max-w-md shrink-0 md:max-w-[46%] lg:max-w-md">
                  <p className={`text-[10px] font-semibold tracking-[0.2em] ${t.accent}`}>
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-1.5 font-display text-[1.55rem] font-bold leading-[1.08] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.75rem] xl:text-[3.1rem]">
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
                      className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold sm:w-fit ${t.btn}`}
                    >
                      {slide.ctaLabel}
                    </Link>
                  </div>
                </div>

                {slide.products.length > 0 ? (
                  <div
                    className={`hidden flex-wrap items-end justify-end gap-2 md:flex md:max-w-[48%] lg:max-w-[55%] ${
                      showMotion && on ? "hero-tiles-in" : ""
                    }`}
                  >
                    {slide.products.map((p, pi) => (
                      <ProductTile
                        key={p.id}
                        product={p}
                        theme={slide.theme}
                        rotate={pi === 0 ? -3 : pi === 1 ? 2.5 : -1.5}
                        delay={pi * 70}
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
              ? "right-[4%] top-1/2 hidden h-[55%] w-[55%] max-w-[300px] -translate-y-1/2 overflow-hidden rounded-full md:block"
              : "hidden w-[50%] md:block lg:w-[55%]"
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

function ProductTile({
  product,
  theme,
  rotate,
  animate,
}: {
  product: CampaignProduct;
  theme: HeroTheme;
  rotate: number;
  delay: number;
  animate: boolean;
}) {
  const t = THEME[theme];
  const pct = discountPercent(product.price, product.oldPrice);
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`relative w-[110px] rounded-xl bg-white p-2 shadow-lg lg:w-[130px] ${
        animate ? "hero-float-tile" : ""
      }`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="relative aspect-square w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-1"
          sizes="130px"
        />
      </div>
      <span
        className={`absolute -bottom-2 -right-2 flex h-[56px] w-[56px] flex-col items-center justify-center rounded-full text-center shadow-md ring-2 ring-white lg:h-[76px] lg:w-[76px] ${t.bubble} ${
          animate ? "hero-bubble-in" : ""
        }`}
      >
        <span className="text-[8px] font-semibold leading-none lg:text-[9px]">KES</span>
        <span className="text-[10px] font-bold leading-tight lg:text-sm">
          {product.price.toLocaleString("en-KE")}
        </span>
        {product.oldPrice && pct != null ? (
          <span className="text-[7px] line-through opacity-70 lg:text-[8px]">
            {formatKes(product.oldPrice).replace("KES ", "")}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/** Offer cards for the right column — first two products of active slide */
export function HeroOfferCards({ products }: { products: CampaignProduct[] }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {products.slice(0, 2).map((product) => {
        const pct = discountPercent(product.price, product.oldPrice);
        return (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="flex h-full min-h-[120px] flex-1 items-stretch gap-3 overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition hover:shadow-md"
          >
            <div className="relative w-[40%] shrink-0 self-stretch bg-ink/[0.03] sm:w-[42%]">
              <Image
                src={product.image}
                alt=""
                fill
                className="object-contain p-2"
                sizes="140px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-3 pr-3">
              {pct != null ? (
                <span className="w-fit rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-ink">
                  -{pct}%
                </span>
              ) : null}
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{product.name}</p>
              <p className="mt-1 font-display text-base font-bold text-ink">
                {formatKes(product.price)}
                {product.oldPrice && pct != null ? (
                  <span className="ml-1.5 text-xs font-normal text-ink/40 line-through">
                    {formatKes(product.oldPrice)}
                  </span>
                ) : null}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
