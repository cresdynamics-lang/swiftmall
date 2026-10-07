"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { formatKes } from "@/lib/format";

export function SearchBox({ className = "" }: { className?: string }) {
  const categories = useCategories();
  const { search } = useProducts();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => search(q, 6), [q, search]);
  const matchingCats = useMemo(() => {
    const lower = q.trim().toLowerCase();
    if (lower.length < 2) return [];
    return categories.filter((c) => c.name.toLowerCase().includes(lower)).slice(0, 3);
  }, [q, categories]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className={`relative flex-1 ${className}`}>
      <div className="flex overflow-hidden rounded-md border border-white/15 bg-white focus-within:ring-2 focus-within:ring-brand">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products, brands and categories..."
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink/45"
          aria-label="Search"
        />
        <button
          type="button"
          className="bg-brand px-3 text-ink transition hover:bg-brand-dark"
          aria-label="Submit search"
        >
          <SearchIcon />
        </button>
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-xl">
          {results.length === 0 && matchingCats.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink/60">No results for “{q}”</p>
          ) : (
            <>
              <ul className="divide-y divide-ink/5">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-ink/[0.03]"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-ink/[0.04]">
                        <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink/50">
                          in {categories.find((c) => c.slug === p.category)?.name}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-ink">{formatKes(p.price)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              {matchingCats.length > 0 && (
                <div className="border-t border-ink/10 bg-ink/[0.02] px-3 py-2">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-ink/45">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {matchingCats.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/category/${c.slug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-white px-2.5 py-1 text-xs text-ink ring-1 ring-ink/10 hover:ring-brand"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link
                href={`/search?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="block border-t border-ink/10 px-4 py-2.5 text-center text-sm font-medium text-ink hover:bg-brand/20"
              >
                See all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
