"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { sectionIdForCategory } from "@/lib/categories";

export function MarketNavStrip() {
  const pathname = usePathname();
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
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (!onHome) {
      setActiveSlug(null);
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
          setActiveSlug(slug);
        }
      },
      {
        root: null,
        // Account for sticky header + category strip
        rootMargin: "-28% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const el of sections) observer.observe(el);
    return () => observer.disconnect();
  }, [onHome, deptSlugs]);

  useEffect(() => {
    if (!activeSlug || !onHome) return;
    const chip = chipRefs.current[activeSlug];
    const scroller = scrollerRef.current;
    if (!chip || !scroller) return;
    const left =
      chip.offsetLeft - scroller.clientWidth / 2 + chip.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSlug, onHome]);

  function categoryHref(slug: string) {
    return onHome ? `#${sectionIdForCategory(slug)}` : `/category/${slug}`;
  }

  return (
    <div className="border-b border-ink/10 bg-white shadow-sm">
      <div
        ref={scrollerRef}
        className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:gap-2 sm:px-4 sm:py-2.5 lg:gap-3 lg:px-6 [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href={onHome ? "#whats-new" : "/deals?tab=new"}
          className="inline-flex shrink-0 items-center rounded-md px-2.5 py-2 text-sm font-bold text-ink hover:bg-ink/[0.04] sm:px-3 sm:text-base lg:px-4 lg:text-lg"
        >
          What&apos;s New
        </Link>
        <Link
          href={onHome ? "#flash-deals" : "/deals"}
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brand px-2.5 py-2 text-sm font-bold text-ink hover:bg-brand-dark sm:px-3 sm:text-base lg:px-4 lg:text-lg"
        >
          <span aria-hidden>⚡</span> Flash Sale
        </Link>
        <span className="mx-1 hidden h-6 w-px shrink-0 bg-ink/15 lg:block" aria-hidden />
        {depts.map((c) => {
          const active = onHome && activeSlug === c.slug;
          return (
            <Link
              key={c.slug}
              href={categoryHref(c.slug)}
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
