"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProduct } from "@/app/management/actions";
import {
  CATEGORY_SUB_OPTIONS,
  needsGender,
  suggestedSizePreset,
} from "@/lib/category-subs";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import {
  SIZE_PRESET_OPTIONS,
  SHOE_EU_SIZES,
  TEDDY_CM_SIZES,
  detectSizePreset,
  type SizePreset,
} from "@/lib/product-sizes";
import {
  defaultShoeSizePrices,
  defaultTeddySizePrices,
  TEDDY_SIZE_PRICES,
} from "@/lib/product-price";
import { extraAngleLabel } from "@/lib/product-angles";
import {
  MAX_PRODUCT_IMAGES,
  OFFER_TAG_OPTIONS,
  type OfferTag,
  type Product,
} from "@/lib/product-types";

type PendingFile = { key: string; file: File; url: string };

const MAX_ANGLES = MAX_PRODUCT_IMAGES - 1;

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
  const [offerTag, setOfferTag] = useState<OfferTag>(
    product?.offerTag ?? (product ? "NONE" : "NEW"),
  );
  const [categorySlug, setCategorySlug] = useState(
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [subCategory, setSubCategory] = useState(product?.subCategory ?? "");
  const [gender, setGender] = useState(
    product?.gender === "mens"
      ? "MENS"
      : product?.gender === "womens"
        ? "WOMENS"
        : product?.gender === "unisex"
          ? "UNISEX"
          : "",
  );
  const [sizePreset, setSizePreset] = useState<SizePreset>(
    product ? detectSizePreset(product.sizes ?? []) : suggestedSizePreset(categorySlug),
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes ?? []);
  const [sizePrices, setSizePrices] = useState<Record<string, string>>(() => {
    const existing = product?.sizePrices ?? {};
    const out: Record<string, string> = {};
    for (const [size, value] of Object.entries(existing)) {
      out[size] = String(value);
    }
    const teddyDefaults = defaultTeddySizePrices([...TEDDY_CM_SIZES]);
    for (const size of TEDDY_CM_SIZES) {
      if (!out[size] && teddyDefaults[size] != null) out[size] = String(teddyDefaults[size]);
    }
    const shoeSizes = (product?.sizes ?? []).filter((s) => SHOE_EU_SIZES.includes(s));
    const base = product?.price ?? 0;
    if (shoeSizes.length && base > 0) {
      const scaled = defaultShoeSizePrices(base, shoeSizes);
      const flat =
        shoeSizes.length > 1 &&
        shoeSizes.every((s) => out[s] === out[shoeSizes[0]]);
      for (const size of shoeSizes) {
        if (!out[size] || flat) out[size] = String(scaled[size]);
      }
    }
    return out;
  });
  const [customSizes, setCustomSizes] = useState(
    detectSizePreset(product?.sizes ?? []) === "CUSTOM"
      ? (product?.sizes ?? []).join(", ")
      : "",
  );
  const existing = product?.images ?? [];
  const [keepDisplay, setKeepDisplay] = useState(existing[0] ?? "");
  const [pendingDisplay, setPendingDisplay] = useState<PendingFile | null>(null);
  const [keepAngles, setKeepAngles] = useState<string[]>(existing.slice(1));
  const [pendingAngles, setPendingAngles] = useState<PendingFile[]>([]);
  const [displayInputKey, setDisplayInputKey] = useState(0);
  const [anglesInputKey, setAnglesInputKey] = useState(0);

  const displayPreview = pendingDisplay?.url || keepDisplay;
  const anglePreviews = useMemo(
    () => [...keepAngles, ...pendingAngles.map((p) => p.url)],
    [keepAngles, pendingAngles],
  );
  const anglesLeft = MAX_ANGLES - keepAngles.length - pendingAngles.length;

  const priceNum = Number(price) || 0;
  const oldNum = oldPrice ? Number(oldPrice) : undefined;
  const pct = discountPercent(priceNum, oldNum);
  const previewTag = offerTagLabel({
    price: priceNum,
    oldPrice: oldNum,
    offerTag,
  });

  const presetMeta = SIZE_PRESET_OPTIONS.find((o) => o.value === sizePreset);
  const subOptions = CATEGORY_SUB_OPTIONS[categorySlug] ?? [];
  const fashionGender = needsGender(categorySlug);

  const preview = useMemo(
    () => ({
      pct,
      promo: previewTag,
      save: oldNum && oldNum > priceNum ? formatKes(oldNum - priceNum) : null,
    }),
    [pct, previewTag, oldNum, priceNum],
  );

  function onCategoryChange(next: string) {
    setCategorySlug(next);
    setSubCategory("");
    if (!product) {
      const suggested = suggestedSizePreset(next);
      onPresetChange(suggested);
      if (!needsGender(next)) setGender("");
    }
  }

  function applyShoeScale(sizes: string[], base: number, overwrite = false) {
    if (base <= 0) return;
    const scaled = defaultShoeSizePrices(base, sizes);
    setSizePrices((prev) => {
      const out = { ...prev };
      for (const size of sizes) {
        if (!overwrite && out[size]) continue;
        if (scaled[size] != null) out[size] = String(scaled[size]);
      }
      return out;
    });
  }

  function seedSizePrices(sizes: string[], fallback?: number) {
    setSizePrices((prev) => {
      const out = { ...prev };
      const teddyDefaults = defaultTeddySizePrices([...TEDDY_CM_SIZES]);
      for (const size of sizes) {
        if (out[size]) continue;
        if (teddyDefaults[size] != null) out[size] = String(teddyDefaults[size]);
        else if (fallback != null && fallback > 0) out[size] = String(fallback);
      }
      return out;
    });
  }

  function onPresetChange(next: SizePreset) {
    setSizePreset(next);
    const meta = SIZE_PRESET_OPTIONS.find((o) => o.value === next);
    if (next === "NONE") {
      setSelectedSizes([]);
      setCustomSizes("");
    } else if (next === "CUSTOM") {
      setSelectedSizes([]);
    } else if (meta?.options.length) {
      setSelectedSizes([...meta.options]);
      if (next === "TEDDY_CM") {
        seedSizePrices([...TEDDY_CM_SIZES]);
        const defaults = defaultTeddySizePrices([...TEDDY_CM_SIZES]);
        const min = Math.min(...Object.values(defaults));
        if (!price || Number(price) <= 0) setPrice(String(min));
      } else if (next === "SHOE_EU") {
        const base = Number(price) || product?.price || 0;
        applyShoeScale([...SHOE_EU_SIZES], base, true);
      }
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) => {
      const next = prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size];
      if (!prev.includes(size)) {
        const base = Number(price) || product?.price || 0;
        if (sizePreset === "SHOE_EU") applyShoeScale([size], base);
        else seedSizePrices([size], base);
      }
      return next;
    });
  }

  function fillShoePricesFromListing() {
    const base = Number(price) || 0;
    if (base <= 0) return;
    applyShoeScale(selectedSizes, base, true);
  }

  function onDisplaySelected(file: File | null) {
    if (!file) return;
    if (pendingDisplay) URL.revokeObjectURL(pendingDisplay.url);
    setPendingDisplay({
      key: `${file.name}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
    });
    setDisplayInputKey((k) => k + 1);
  }

  function clearDisplay() {
    if (pendingDisplay) URL.revokeObjectURL(pendingDisplay.url);
    setPendingDisplay(null);
    setKeepDisplay("");
    setDisplayInputKey((k) => k + 1);
  }

  function onAnglesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;
    const room = MAX_ANGLES - keepAngles.length - pendingAngles.length;
    if (room <= 0) return;
    const next: PendingFile[] = [];
    for (const file of Array.from(fileList).slice(0, room)) {
      next.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        url: URL.createObjectURL(file),
      });
    }
    setPendingAngles((prev) => [...prev, ...next]);
    setAnglesInputKey((k) => k + 1);
  }

  function removeKeepAngle(index: number) {
    setKeepAngles((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingAngle(index: number) {
    setPendingAngles((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveKeepAngle(index: number, dir: -1 | 1) {
    setKeepAngles((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  return (
    <form action={saveProduct} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="sizePreset" value={sizePreset} />
      {keepDisplay && !pendingDisplay ? (
        <input type="hidden" name="keepDisplay" value={keepDisplay} />
      ) : null}
      {keepAngles.map((src) => (
        <input key={src} type="hidden" name="keepAngles" value={src} />
      ))}

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
              value={categorySlug}
              onChange={(e) => onCategoryChange(e.target.value)}
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
            {subOptions.length ? (
              <select
                name="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={fieldClass}
              >
                <option value="">Select…</option>
                {subOptions.map((o) => (
                  <option key={o.slug} value={o.label}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className={fieldClass}
                placeholder="Optional"
              />
            )}
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
        <p className="text-xs text-ink/50">
          Use offer tag <strong>New</strong> for the What&apos;s New row. Tick Flash deal for the
          yellow flash panel (also set flash end time in Settings).
        </p>

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
          <Field label={fashionGender ? "Gender * (Men’s / Women’s / Unisex)" : "Gender"}>
            <select
              name="gender"
              required={fashionGender}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={fieldClass}
            >
              <option value="">{fashionGender ? "Select…" : "None"}</option>
              <option value="MENS">Men&apos;s</option>
              <option value="WOMENS">Women&apos;s</option>
              <option value="UNISEX">Unisex</option>
            </select>
          </Field>
        </div>
        {fashionGender ? (
          <p className="text-xs text-amber-800">
            Fashion needs gender so Men&apos;s / Women&apos;s / Unisex filters and home tabs work.
            Unisex items also appear under Men&apos;s and Women&apos;s.
          </p>
        ) : null}

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
          <p className="mt-1 text-xs text-ink/50">
            {presetMeta?.hint}
            {categorySlug === "fashion"
              ? " — use Shoes (EU) for footwear; No sizes for bags/wallets."
              : null}
            {categorySlug === "gifts-and-accessories"
              ? " — use Teddy (cm) for bear heights; No sizes for flowers/jewellery."
              : null}
            {categorySlug === "health-and-beauty" ||
            categorySlug === "electronics" ||
            categorySlug === "phones-and-accessories" ||
            categorySlug === "kitchen-and-home"
              ? " — leave as No sizes for this department."
              : null}
          </p>

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
                    onClick={() => {
                      const all = [...(presetMeta?.options ?? [])];
                      setSelectedSizes(all);
                      const base = Number(price) || product?.price || 0;
                      if (sizePreset === "SHOE_EU") applyShoeScale(all, base, true);
                      else seedSizePrices(all, base);
                    }}
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
              {(sizePreset === "TEDDY_CM" || sizePreset === "SHOE_EU") &&
              selectedSizes.length > 0 ? (
                <div className="mt-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink/80">
                      {sizePreset === "TEDDY_CM"
                        ? "Price per size (KES) — 40 cm = 1,200 · 200 cm = 10,000"
                        : "Price per shoe size (KES)"}
                    </p>
                    {sizePreset === "SHOE_EU" ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-ink underline"
                        onClick={fillShoePricesFromListing}
                      >
                        Scale prices from listing
                      </button>
                    ) : null}
                  </div>
                  <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                    {selectedSizes.map((size) => (
                      <label
                        key={size}
                        className="flex items-center gap-2 text-xs font-medium text-ink/70"
                      >
                        <span className="w-16 shrink-0">{size}</span>
                        <input
                          type="number"
                          name={`sizePrice[${size}]`}
                          min={1}
                          step={1}
                          value={
                            sizePrices[size] ??
                            (sizePreset === "TEDDY_CM"
                              ? String(TEDDY_SIZE_PRICES[size] ?? "")
                              : price || "")
                          }
                          onChange={(e) =>
                            setSizePrices((prev) => ({
                              ...prev,
                              [size]: e.target.value,
                            }))
                          }
                          className={fieldClass}
                        />
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink/45">
                    Listing shows the lowest size price. Cart charges the size the shopper picks.
                  </p>
                </div>
              ) : null}
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

        <div className="space-y-3 rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
          <h3 className="text-sm font-bold text-ink">1. Display image *</h3>
          <p className="text-xs text-ink/50">
            Main photo shown on listings, search, and as the first product-page view. JPG /
            PNG / WebP, max 5MB.
          </p>
          <Field label="Upload display image">
            <input
              key={displayInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fieldClass}
              onChange={(e) => onDisplaySelected(e.target.files?.[0] ?? null)}
            />
          </Field>
          {displayPreview ? (
            <div className="relative w-36 overflow-hidden rounded-md bg-white ring-1 ring-ink/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayPreview}
                alt=""
                className="aspect-square w-full object-contain p-1"
              />
              <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-brand">
                Display{pendingDisplay ? " · New" : ""}
              </span>
              <div className="flex border-t border-ink/8 p-1.5">
                <button
                  type="button"
                  onClick={clearDisplay}
                  className="ml-auto text-[10px] font-semibold text-red-700 underline"
                >
                  Remove
                </button>
              </div>
              {pendingDisplay ? <PendingFileInput name="displayImageFile" file={pendingDisplay.file} /> : null}
            </div>
          ) : (
            <p className="text-xs text-amber-800">Required — upload a display image before saving.</p>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
          <h3 className="text-sm font-bold text-ink">2. Angle photos</h3>
          <p className="text-xs text-ink/50">
            Extra views shoppers can switch through: Side, Back, Detail… Optional. Up to{" "}
            {MAX_ANGLES} angles.
          </p>
          <Field label="Upload angle photos">
            <input
              key={anglesInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={anglesLeft <= 0}
              className={fieldClass}
              onChange={(e) => onAnglesSelected(e.target.files)}
            />
          </Field>

          {anglePreviews.length ? (
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {keepAngles.map((src, i) => (
                <li
                  key={`angle-${src}`}
                  className="relative overflow-hidden rounded-md bg-white ring-1 ring-ink/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-square w-full object-contain p-1" />
                  <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-brand">
                    {extraAngleLabel(i)}
                  </span>
                  <div className="flex flex-wrap gap-1 border-t border-ink/8 p-1.5">
                    {i > 0 ? (
                      <button
                        type="button"
                        onClick={() => moveKeepAngle(i, -1)}
                        className="text-[10px] font-semibold text-ink/55 underline"
                      >
                        ←
                      </button>
                    ) : null}
                    {i < keepAngles.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => moveKeepAngle(i, 1)}
                        className="text-[10px] font-semibold text-ink/55 underline"
                      >
                        →
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeKeepAngle(i)}
                      className="ml-auto text-[10px] font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
              {pendingAngles.map((item, i) => (
                <li
                  key={item.key}
                  className="relative overflow-hidden rounded-md bg-white ring-1 ring-brand/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="aspect-square w-full object-contain p-1" />
                  <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-ink">
                    {extraAngleLabel(keepAngles.length + i)} · New
                  </span>
                  <div className="flex border-t border-ink/8 p-1.5">
                    <button
                      type="button"
                      onClick={() => removePendingAngle(i)}
                      className="ml-auto text-[10px] font-semibold text-red-700 underline"
                    >
                      Remove
                    </button>
                  </div>
                  <PendingFileInput name="angleFiles" file={item.file} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink/45">No angle photos yet — optional.</p>
          )}
          <p className="text-xs text-ink/45">
            {anglePreviews.length}/{MAX_ANGLES} angles
            {anglesLeft <= 0 ? " — limit reached." : ` · ${anglesLeft} more can be added.`}
          </p>
        </div>

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
          <SaveProductButton />
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
        {displayPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPreview}
            alt=""
            className="mt-3 h-36 w-full rounded-md object-contain bg-ink/[0.03]"
          />
        ) : (
          <p className="mt-3 text-xs text-ink/45">No display image yet</p>
        )}
        {anglePreviews.length ? (
          <div className="mt-2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink/40">
              Angles
            </p>
            <div className="grid grid-cols-4 gap-1">
              {anglePreviews.slice(0, 4).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${i}`}
                  src={src}
                  alt=""
                  className="aspect-square rounded object-cover ring-1 ring-ink/10"
                />
              ))}
            </div>
          </div>
        ) : null}
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

function SaveProductButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save product"}
    </button>
  );
}

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

/** Attach a File to FormData — input.files is not assignable via React props. */
function PendingFileInput({ name, file }: { name: string; file: File }) {
  return (
    <input
      type="file"
      name={name}
      className="hidden"
      ref={(el) => {
        if (!el || el.files?.[0] === file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        el.files = dt.files;
      }}
    />
  );
}
