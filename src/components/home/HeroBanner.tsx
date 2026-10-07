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
} from "@/lib/hero-slides";

export type HeroOfferProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image: string;
};

export type HeroSlideView = HeroSlideDef & {
  offers: HeroOfferProduct[];
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

export function HeroBanner({ slides }: { slides: HeroSlideView[] }) {
  const safe = slides.length ? slides : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [manualHoldUntil, setManualHoldUntil] = useState(0);
  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const rafRef = useRef(0);
  const regionRef = useRef<HTMLElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const active = safe[index] ?? safe[0];
  const n = safe.length;

  const goTo = useCallback(
    (i: number, manual = false) => {
      if (!n) return;
      const next = ((i % n) + n) % n;
      setIndex(next);
      setProgress(0);
      startRef.current = performance.now();
      elapsedRef.current = 0;
      if (manual) setManualHoldUntil(Date.now() + HERO_MANUAL_PAUSE_MS);
      if (liveRef.current && safe[next]) {
        liveRef.current.textContent = `Showing ${safe[next].eyebrow}`;
      }
    },
    [n, safe],
  );

  useEffect(() => {
    setReduced(prefersReducedMotion());
    setDataSaver(prefersDataSaver());
  }, []);

  useEffect(() => {
    if (!active) return;
    const img = new window.Image();
    img.src = active.image;
    img.onload = () => setReady(true);
    img.onerror = () => setReady(true);
  }, [active]);

  useEffect(() => {
    if (!n || reduced || dataSaver || !ready) return;

    const tick = (now: number) => {
      const held = Date.now() < manualHoldUntil;
      const offscreen = (() => {
        const el = regionRef.current;
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        return visible < r.height * 0.25;
      })();
      const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
      const stop = paused || held || offscreen || hidden;

      if (!stop) {
        if (!startRef.current) startRef.current = now - elapsedRef.current;
        const elapsed = now - startRef.current;
        elapsedRef.current = elapsed;
        const p = Math.min(1, elapsed / HERO_SLIDE_MS);
        setProgress(p);
        if (p >= 1) {
          goTo(index + 1);
        }
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
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
      }}
      className="mx-auto max-w-7xl px-3 py-3 sm:px-4 outline-none"
    >
      <p ref={liveRef} className="sr-only" aria-live="polite" />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Main hero */}
        <div
          className="relative overflow-hidden rounded-2xl bg-ink text-white"
          style={{ aspectRatio: "16 / 10" }}
        >
          {safe.map((slide, i) => {
            const on = i === index;
            return (
              <article
                key={slide.id}
                aria-hidden={!on}
                className="absolute inset-0"
                style={{
                  opacity: on ? 1 : 0,
                  transition: showMotion
                    ? `opacity ${HERO_CROSSFADE_MS}ms ease`
                    : "none",
                  pointerEvents: on ? "auto" : "none",
                  zIndex: on ? 2 : 1,
                }}
              >
                <HeroVisual slide={slide} active={on && showMotion} priority={i === 0} />
                <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:justify-center sm:p-8 lg:max-w-[42%]">
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-brand sm:text-xs">
                    {slide.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-[1.875rem] font-bold leading-[1.1] sm:text-[2.875rem]">
                    <span className={showMotion && on ? "hero-rise" : ""}>{slide.headline}</span>
                    <br />
                    <span
                      className={`text-brand ${showMotion && on ? "hero-rise hero-rise-delay" : ""}`}
                    >
                      {slide.headlineAccent}
                    </span>
                  </h2>
                  <p
                    className={`mt-3 max-w-md text-sm text-white/70 sm:text-base ${
                      showMotion && on ? "hero-fade" : ""
                    }`}
                  >
                    {slide.subtext}
                  </p>
                  <Link
                    href={slide.ctaHref}
                    className={`mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-brand px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-dark sm:w-fit sm:min-h-0 sm:py-2.5 ${
                      showMotion && on ? "hero-fade hero-fade-delay" : ""
                    }`}
                  >
                    {slide.ctaLabel}
                  </Link>
                </div>
              </article>
            );
          })}

          {/* Controls */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 sm:bottom-4 sm:left-4">
            <button
              type="button"
              aria-label={paused ? "Play carousel" : "Pause carousel"}
              onClick={() => setPaused((p) => !p)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {paused ? "▶" : "❚❚"}
            </button>
            <div className="flex flex-1 gap-1.5">
              {safe.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}: ${s.eyebrow}`}
                  onClick={() => goTo(i, true)}
                  className="group relative h-11 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                    <span
                      className="block h-full rounded-full bg-brand transition-[width] duration-75"
                      style={{
                        width:
                          i < index
                            ? "100%"
                            : i === index
                              ? `${(reduced || dataSaver ? 0 : progress) * 100}%`
                              : "0%",
                        background: i < index ? "#fff" : undefined,
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden gap-1 sm:flex">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(index - 1, true)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-brand"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(index + 1, true)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-brand"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Offer cards — stack on desktop, swipe row on mobile */}
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45 lg:hidden">
            Offers
          </p>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] snap-x snap-mandatory lg:mx-0 lg:grid lg:grid-cols-1 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0">
            {active.offers.map((product, oi) => {
              const pct = discountPercent(product.price, product.oldPrice);
              return (
                <Link
                  key={`${active.id}-${product.id}`}
                  href={`/product/${product.slug}`}
                  className="flex min-h-[140px] w-[78%] shrink-0 snap-start items-stretch gap-3 overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition hover:shadow-md sm:w-[48%] lg:w-auto"
                  style={
                    showMotion
                      ? {
                          animation: `hero-offer-in 0.45s ease ${0.3 + oi * 0.08}s both`,
                        }
                      : undefined
                  }
                >
                  <div className="relative w-[42%] shrink-0 bg-ink/[0.03] sm:w-36 lg:w-[45%]">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-contain p-2"
                      sizes="180px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center py-3 pr-3">
                    {pct != null ? (
                      <span className="w-fit rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
                        -{pct}%
                      </span>
                    ) : null}
                    <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-ink">
                      {product.name}
                    </p>
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
        </div>
      </div>

    </section>
  );
}

function HeroVisual({
  slide,
  active,
  priority,
}: {
  slide: HeroSlideView;
  active: boolean;
  priority?: boolean;
}) {
  const glow = (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,196,0,0.32),_transparent_55%)]"
      style={active ? { animation: "hero-glow 6s ease-in-out infinite" } : undefined}
    />
  );

  if (slide.layout === "full-bleed") {
    return (
      <>
        <div className="absolute inset-0">
          <div
            className="absolute inset-y-0 right-0 w-full sm:w-[60%]"
            style={
              active
                ? { animation: "hero-zoom 5s linear forwards", transformOrigin: "center" }
                : undefined
            }
          >
            <HeroImg slide={slide} priority={priority} objectPosition={slide.focal} />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/75 to-ink sm:bg-gradient-to-r sm:from-ink sm:via-ink/75 sm:to-transparent"
            style={{
              // desktop: solid to ~30%, 75% at ~46%, clear ~70%
              backgroundImage:
                "linear-gradient(to right, #0B0B0B 0%, #0B0B0B 30%, rgba(11,11,11,0.75) 46%, transparent 70%)",
            }}
          />
          {/* mobile override */}
          <div
            aria-hidden
            className="absolute inset-0 sm:hidden"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, transparent 0%, rgba(11,11,11,0.55) 42%, #0B0B0B 68%)",
            }}
          />
        </div>
      </>
    );
  }

  if (slide.layout === "circle") {
    return (
      <>
        {glow}
        <div
          className="absolute right-[-8%] top-1/2 hidden h-[70%] w-[70%] -translate-y-1/2 sm:block lg:right-[2%]"
          style={
            active
              ? {
                  animation: "hero-grow 0.8s ease forwards, hero-float 5s ease-in-out 0.8s infinite",
                }
              : undefined
          }
        >
          <div
            aria-hidden
            className="absolute inset-[-6px] rounded-full ring-2 ring-white/80"
          />
          <div className="relative h-full w-full overflow-hidden rounded-full bg-brand">
            <HeroImg slide={slide} priority={priority} objectPosition={slide.focal} />
          </div>
        </div>
        {/* mobile circle */}
        <div
          className="absolute left-1/2 top-3 w-[74%] -translate-x-1/2 sm:hidden"
          style={{ aspectRatio: "1" }}
        >
          <div aria-hidden className="absolute inset-[-4px] rounded-full ring-2 ring-white/80" />
          <div className="relative h-full w-full overflow-hidden rounded-full bg-brand">
            <HeroImg slide={slide} priority={priority} objectPosition={slide.focal} />
          </div>
        </div>
      </>
    );
  }

  // tile
  return (
    <>
      {glow}
      <div
        className="absolute right-[6%] top-1/2 hidden h-[64%] w-[38%] -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl sm:block"
        style={
          active
            ? {
                animation: "hero-grow 0.8s ease forwards, hero-float 5s ease-in-out 0.8s infinite",
              }
            : undefined
        }
      >
        <HeroImg slide={slide} priority={priority} objectFit="contain" />
      </div>
      <div
        className="absolute left-1/2 top-4 w-[62%] -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-lg sm:hidden"
        style={{ aspectRatio: "1" }}
      >
        <HeroImg slide={slide} priority={priority} objectFit="contain" />
      </div>
    </>
  );
}

function HeroImg({
  slide,
  priority,
  objectPosition,
  objectFit = "cover",
}: {
  slide: HeroSlideView;
  priority?: boolean;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
}) {
  if (slide.imageSrcSet) {
    return (
      <picture>
        <source type="image/webp" srcSet={slide.imageSrcSet.webp} sizes="(max-width: 768px) 800px, (max-width: 1280px) 1280px, 1920px" />
        <source type="image/jpeg" srcSet={slide.imageSrcSet.jpg} sizes="(max-width: 768px) 800px, (max-width: 1280px) 1280px, 1920px" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.image}
          alt={slide.imageAlt}
          className={`h-full w-full ${objectFit === "contain" ? "object-contain p-4" : "object-cover"}`}
          style={{ objectPosition }}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
        />
      </picture>
    );
  }

  return (
    <Image
      src={slide.image}
      alt={slide.imageAlt}
      fill
      priority={priority}
      className={objectFit === "contain" ? "object-contain p-4" : "object-cover"}
      style={{ objectPosition }}
      sizes="(max-width: 768px) 90vw, 55vw"
    />
  );
}
