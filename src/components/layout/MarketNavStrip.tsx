"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { sectionIdForCategory } from "@/lib/categories";

export function MarketNavStrip() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onWhatsNew = pathname === "/deals" && searchParams.get("tab") === "new";
  const onFlash = pathname === "/deals" && searchParams.get("tab") !== "new";
  const categories = useCategories();
  const { products } = useProducts();
  const depts = useMemo(
    () =>
      categories.filter(
        (c) => c.slug !== "others" && products.some((p) => p.category === c.slug),
      ),
    [categories, products],
  );
  const deptSlugs = useMemo(() => depts.map((c) => c.slug).join("|"), [depts]);
  const onHome = pathname === "/";
  const activeFromRoute = pathname.startsWith("/category/")
    ? pathname.split("/")[2] ?? null
    : null;
  const [scrollSlug, setScrollSlug] = useState<string | null>(null);
  const activeSlug = activeFromRoute ?? (onHome ? scrollSlug : null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (!onHome) {
      setScrollSlug(null);
      return;
    }

    const slugs = deptSlugs ? deptSlugs.split("|") : [];
    const sections = slugs
      .map((slug) => document.getElementById(sectionIdForCategory(slug)))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target?.id) {
          const slug = top.target.id.replace(/^department-/, "");
          setScrollSlug(slug);
        }
      },
      {
        root: null,
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [onHome, deptSlugs]);

  useEffect(() => {
    if (!activeSlug) return;
    const chip = chipRefs.current[activeSlug];
    const scroller = scrollerRef.current;
    if (!chip || !scroller) return;
    const left =
      chip.offsetLeft - scroller.clientWidth / 2 + chip.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSlug]);

  return (
    <div className="border-b border-ink/10 bg-white shadow-sm">
      <div
        ref={scrollerRef}
        className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:gap-2 sm:px-4 sm:py-2.5 lg:gap-3 lg:px-6 [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/deals?tab=new"
          className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-2 text-sm font-bold sm:px-3 sm:text-base lg:px-4 lg:text-lg ${
            onWhatsNew ? "bg-ink text-white" : "text-ink hover:bg-ink/[0.04]"
          }`}
        >
          What&apos;s New
        </Link>
        <Link
          href="/deals"
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-2 text-sm font-bold sm:px-3 sm:text-base lg:px-4 lg:text-lg ${
            onFlash
              ? "bg-brand-dark text-ink"
              : "bg-brand text-ink hover:bg-brand-dark"
          }`}
        >
          <span aria-hidden>⚡</span> Flash Sale
        </Link>
        <span className="mx-1 hidden h-6 w-px shrink-0 bg-ink/15 lg:block" aria-hidden />
        {depts.map((c) => {
          const active = activeSlug === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              ref={(el) => {
                chipRefs.current[c.slug] = el;
              }}
              className={`inline-flex shrink-0 items-center rounded-md px-2.5 py-2 text-sm font-bold sm:px-3 sm:text-base lg:px-4 lg:text-lg ${
                active
                  ? "bg-ink text-white"
                  : "text-ink/85 hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              {c.shortName}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
