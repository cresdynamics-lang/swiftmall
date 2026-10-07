"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteProduct, toggleProductLive } from "@/app/management/actions";
import { formatKes } from "@/lib/format";
import type { Product } from "@/lib/product-types";

type CategoryOption = { slug: string; name: string };

export function ProductsTable({
  products,
  categories,
}: {
  products: Product[];
  categories: CategoryOption[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.brand ?? ""} ${p.categoryName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white">
            Import from Excel
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" />
          </label>
          <Link
            href="/management/products/new"
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            + Add product
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="min-w-[200px] flex-1 rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink/8">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.03] text-[11px] uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3">Live</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                <td className="px-3 py-3">
                  <Link href={`/management/products/${p.id}`} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded bg-ink/[0.04]">
                      <Image
                        src={p.images[0] ?? "/products/p01.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="font-medium text-ink">{p.name}</span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-ink/70">
                  {p.categoryName ?? p.category}
                  {p.gender === "mens" ? " › Men" : p.gender === "womens" ? " › Women" : ""}
                </td>
                <td className="px-3 py-3 font-semibold">
                  {p.price.toLocaleString("en-KE")}
                </td>
                <td className={`px-3 py-3 ${p.stock <= (p.lowStockAt ?? 3) ? "font-semibold text-red-600" : ""}`}>
                  {p.stock}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={p.live ? "Set offline" : "Set live"}
                    onClick={() => {
                      startTransition(async () => {
                        await toggleProductLive(p.id, !p.live);
                      });
                    }}
                    className={`relative h-6 w-11 rounded-full transition ${
                      p.live ? "bg-brand" : "bg-ink/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                        p.live ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/management/products/${p.id}`}
                    className="mr-3 text-sm font-semibold underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-ink/45">
                  No products match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
