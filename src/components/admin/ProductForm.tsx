"use client";

import { useMemo, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
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

  const priceNum = Number(price) || 0;
  const oldNum = oldPrice ? Number(oldPrice) : undefined;
  const pct = discountPercent(priceNum, oldNum);
  const previewTag = offerTagLabel({
    price: priceNum,
    oldPrice: oldNum,
    offerTag,
  });

  const imageDefault = product?.images?.[0] ?? "/products/p01.jpg";

  const preview = useMemo(
    () => ({
      pct,
      promo: previewTag,
      save:
        oldNum && oldNum > priceNum ? formatKes(oldNum - priceNum) : null,
    }),
    [pct, previewTag, oldNum, priceNum],
  );

  return (
    <form action={saveProduct} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}

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
              <option value="MENS">Men's</option>
              <option value="WOMENS">Women's</option>
            </select>
          </Field>
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

        <button
          type="submit"
          className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Save product
        </button>
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
        <p className="mt-4 text-xs leading-relaxed text-ink/55">
          Discount % is calculated from price vs old price. Offer tags map to hero chips:
          Today, This week, or New - same labels shoppers see on cards and product pages.
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
