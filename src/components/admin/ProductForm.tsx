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
  const [categorySlug, setCategorySlug] = useState(
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [subCategory, setSubCategory] = useState(product?.subCategory ?? "");
  const [gender, setGender] = useState(
    product?.gender === "mens" ? "MENS" : product?.gender === "womens" ? "WOMENS" : "",
  );
  const [sizePreset, setSizePreset] = useState<SizePreset>(
    product ? detectSizePreset(product.sizes ?? []) : suggestedSizePreset(categorySlug),
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes ?? []);
  const [customSizes, setCustomSizes] = useState(
    detectSizePreset(product?.sizes ?? []) === "CUSTOM"
      ? (product?.sizes ?? []).join(", ")
      : "",
  );
  const [imagePath, setImagePath] = useState(product?.images?.[0] ?? "");
  const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] ?? "");

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
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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
          <Field label={fashionGender ? "Gender * (Men’s / Women’s)" : "Gender"}>
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
            </select>
          </Field>
        </div>
        {fashionGender ? (
          <p className="text-xs text-amber-800">
            Fashion needs gender so Men&apos;s / Women&apos;s filters and home tabs work.
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

        <div className="space-y-3 rounded-lg border border-ink/10 bg-ink/[0.02] p-4">
          <Field label="Product photo *">
            <input
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fieldClass}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </Field>
          <p className="text-xs text-ink/50">
            Upload JPG / PNG / WebP (max 5MB). Or keep an existing path below.
          </p>
          <Field label="Image path (optional override)">
            <input
              name="image"
              value={imagePath}
              onChange={(e) => {
                setImagePath(e.target.value);
                if (e.target.value) setPreviewUrl(e.target.value);
              }}
              className={fieldClass}
              placeholder="/products/your-file.jpg"
            />
          </Field>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="mt-2 h-28 w-28 rounded-md object-contain ring-1 ring-ink/10"
            />
          ) : (
            <p className="text-xs text-amber-800">No photo yet — upload before saving a new product.</p>
          )}
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
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="mt-3 h-36 w-full rounded-md object-contain bg-ink/[0.03]"
          />
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
