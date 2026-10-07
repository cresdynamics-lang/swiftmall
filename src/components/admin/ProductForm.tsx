"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { saveProduct } from "@/app/management/actions";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import {
  SIZE_PRESET_OPTIONS,
  detectSizePreset,
  type SizePreset,
} from "@/lib/product-sizes";
import { OFFER_TAG_OPTIONS, type OfferTag, type Product } from "@/lib/product-types";

type CategoryOption = { slug: string; name: string };

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: CategoryOption[];
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [oldPrice, setOldPrice] = useState(
    product?.oldPrice != null ? String(product.oldPrice) : "",
  );
  const [offerTag, setOfferTag] = useState<OfferTag>(product?.offerTag ?? "NONE");
  const [sizePreset, setSizePreset] = useState<SizePreset>(
    detectSizePreset(product?.sizes ?? []),
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes ?? []);
  const [customSizes, setCustomSizes] = useState(
    detectSizePreset(product?.sizes ?? []) === "CUSTOM"
      ? (product?.sizes ?? []).join(", ")
      : "",
  );

  const priceNum = Number(price) || 0;
  const oldNum = oldPrice ? Number(oldPrice) : undefined;
  const pct = discountPercent(priceNum, oldNum);
  const previewTag = offerTagLabel({
    price: priceNum,
    oldPrice: oldNum,
    offerTag,
  });

  const imageDefault = product?.images?.[0] ?? "/products/p01.jpg";
  const presetMeta = SIZE_PRESET_OPTIONS.find((o) => o.value === sizePreset);

  const preview = useMemo(
    () => ({
      pct,
      promo: previewTag,
      save: oldNum && oldNum > priceNum ? formatKes(oldNum - priceNum) : null,
    }),
    [pct, previewTag, oldNum, priceNum],
  );

  function onPresetChange(next: SizePreset) {
    setSizePreset(next);
    const meta = SIZE_PRESET_OPTIONS.find((o) => o.value === next);
    if (next === "NONE") {
      setSelectedSizes([]);
      setCustomSizes("");
    } else if (next === "CUSTOM") {
      setSelectedSizes([]);
    } else if (meta?.options.length) {
      // Default: all sizes on for the chart; admin can uncheck
      setSelectedSizes([...meta.options]);
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  return (
    <form action={saveProduct} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="sizePreset" value={sizePreset} />

      <div className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <h2 className="font-display text-lg font-bold">
          {product ? "Edit product" : "Add product"}
        </h2>

        <Field label="Name *">
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            name="slug"
            defaultValue={product?.slug ?? ""}
            placeholder="auto from name if blank"
            className={fieldClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category *">
            <select
              name="categorySlug"
              required
              defaultValue={product?.category ?? categories[0]?.slug}
              className={fieldClass}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sub-category">
            <input
              name="subCategory"
              defaultValue={product?.subCategory ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Brand">
            <input name="brand" defaultValue={product?.brand ?? ""} className={fieldClass} />
          </Field>
          <Field label="SKU / code">
            <input name="sku" defaultValue={product?.sku ?? ""} className={fieldClass} />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Price (KES) *">
            <input
              name="price"
              type="number"
              min={1}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Old price (KES)">
            <input
              name="oldPrice"
              type="number"
              min={0}
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className={fieldClass}
              placeholder="Creates -% badge"
            />
          </Field>
          <Field label="Offer tag">
            <select
              name="offerTag"
              value={offerTag}
              onChange={(e) => setOfferTag(e.target.value as OfferTag)}
              className={fieldClass}
            >
              {OFFER_TAG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Stock">
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock ?? 0}
              className={fieldClass}
            />
          </Field>
          <Field label="Low-stock alert at">
            <input
              name="lowStockAt"
              type="number"
              min={0}
              defaultValue={product?.lowStockAt ?? 3}
              className={fieldClass}
            />
          </Field>
          <Field label="Gender (fashion)">
            <select
              name="gender"
              defaultValue={
                product?.gender === "mens"
                  ? "MENS"
                  : product?.gender === "womens"
                    ? "WOMENS"
                    : ""
              }
              className={fieldClass}
            >
              <option value="">None</option>
              <option value="MENS">Men&apos;s</option>
              <option value="WOMENS">Women&apos;s</option>
            </select>
          </Field>
        </div>

        <div className="rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
          <Field label="Size chart">
            <select
              value={sizePreset}
              onChange={(e) => onPresetChange(e.target.value as SizePreset)}
              className={fieldClass}
            >
              {SIZE_PRESET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <p className="mt-1 text-xs text-ink/50">{presetMeta?.hint}</p>

          {sizePreset === "SHOE_EU" || sizePreset === "TEDDY_CM" ? (
            <div className="mt-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink/80">
                  Available sizes ({selectedSizes.length})
                </p>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    className="font-semibold text-ink underline"
                    onClick={() => setSelectedSizes([...(presetMeta?.options ?? [])])}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-ink/50 underline"
                    onClick={() => setSelectedSizes([])}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                {(presetMeta?.options ?? []).map((size) => {
                  const on = selectedSizes.includes(size);
                  return (
                    <label
                      key={size}
                      className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                        on
                          ? "border-brand bg-brand/20 text-ink"
                          : "border-ink/15 bg-white text-ink/55 hover:border-ink/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="sizes"
                        value={size}
                        checked={on}
                        onChange={() => toggleSize(size)}
                        className="sr-only"
                      />
                      {size}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizePreset === "CUSTOM" ? (
            <div className="mt-3">
              <Field label="Custom sizes (comma-separated)">
                <input
                  name="customSizes"
                  value={customSizes}
                  onChange={(e) => setCustomSizes(e.target.value)}
                  placeholder="e.g. S, M, L, XL"
                  className={fieldClass}
                />
              </Field>
            </div>
          ) : null}
        </div>

        <Field label="Primary image path">
          <input
            name="image"
            defaultValue={imageDefault}
            className={fieldClass}
            placeholder="/products/p01.jpg"
          />
        </Field>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input name="live" type="checkbox" defaultChecked={product?.live ?? true} />
            Live on store
          </label>
          <label className="flex items-center gap-2">
            <input
              name="flashDeal"
              type="checkbox"
              defaultChecked={product?.flashDeal ?? false}
            />
            Flash deal
          </label>
          <label className="flex items-center gap-2">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product?.featured ?? false}
            />
            Featured
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Save product
          </button>
          {product?.slug ? (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="rounded-md border border-ink px-5 py-3 text-sm font-semibold hover:bg-ink/5"
            >
              Preview on site
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-xl bg-white p-4 ring-1 ring-ink/8">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
          Storefront preview
        </p>
        <p className="mt-3 line-clamp-2 text-sm font-semibold">{name || "Product name"}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold">
            {priceNum ? formatKes(priceNum) : "KES -"}
          </span>
          {oldNum ? (
            <span className="text-xs text-ink/40 line-through">{formatKes(oldNum)}</span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {preview.pct != null ? (
            <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold text-brand">
              -{preview.pct}%
            </span>
          ) : null}
          {preview.promo ? (
            <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink">
              {preview.promo}
            </span>
          ) : null}
        </div>
        {preview.save ? (
          <p className="mt-2 text-xs text-stock">Save {preview.save}</p>
        ) : null}
        {sizePreset !== "NONE" ? (
          <p className="mt-3 text-xs text-ink/55">
            Shoppers pick a size at checkout:{" "}
            {sizePreset === "CUSTOM"
              ? customSizes || "—"
              : selectedSizes.slice(0, 6).join(", ") +
                (selectedSizes.length > 6 ? ` +${selectedSizes.length - 6} more` : "")}
          </p>
        ) : null}
        <p className="mt-4 text-xs leading-relaxed text-ink/55">
          Shoes use EU 26A–46. Gift teddies use cm heights. Tick only the sizes you stock.
        </p>
      </aside>
    </form>
  );
}

const fieldClass =
  "w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-ink/80">{label}</span>
      {children}
    </label>
  );
}
