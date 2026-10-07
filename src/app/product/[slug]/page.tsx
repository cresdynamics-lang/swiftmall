import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductCard } from "@/components/product/ProductCard";
import { TrackView } from "@/components/product/TrackView";
import { getCategory } from "@/lib/categories";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import { getProduct, getProductsByCategory } from "@/lib/products";
import { paymentLabels, storeConfig } from "@/lib/store-config";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const cat = getCategory(product.category);
  const discount = discountPercent(product.price, product.oldPrice);
  const promo = offerTagLabel(product);
  const related = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <TrackView productId={product.id} />
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href={`/category/${product.category}`} className="hover:text-ink">
          {cat?.name}
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {discount != null && (
              <span className="w-fit rounded bg-ink px-2 py-1 text-xs font-bold text-brand">
                -{discount}%
              </span>
            )}
            {promo && (
              <span className="w-fit rounded bg-brand px-2 py-1 text-xs font-bold uppercase text-ink">
                {promo}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>
          <p className="mt-2 text-sm text-ink/55">
            Category: {cat?.name}
            {product.brand ? ` · ${product.brand}` : ""}
            {product.sku ? ` · Code: ${product.sku}` : ""} ·{" "}
            <span className="text-stock">
              {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink">
              {formatKes(product.price)}
            </span>
            {product.oldPrice ? (
              <>
                <span className="text-lg text-ink/35 line-through">
                  {formatKes(product.oldPrice)}
                </span>
                <span className="text-sm font-semibold text-stock">
                  Save {formatKes(product.oldPrice - product.price)}
                  {discount != null ? ` (-${discount}%)` : ""}
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-ink/55">
            Plus KES {storeConfig.shippingFlatKes} shipping at checkout · Pay a deposit available
          </p>

          <ProductActions productId={product.id} stock={product.stock} />

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {(Object.keys(paymentLabels) as Array<keyof typeof paymentLabels>).map((key) => (
              <div key={key} className="rounded-lg bg-white p-3 ring-1 ring-ink/8">
                <p className="text-sm font-semibold text-ink">{paymentLabels[key].title}</p>
                <p className="mt-0.5 text-xs text-ink/55">{paymentLabels[key].hint}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-ink/45">
            Pay on order · Bank A/C {storeConfig.payments.bankAccount}
            {storeConfig.payments.paybill
              ? ` · Paybill ${storeConfig.payments.paybill}`
              : " · Paybill coming soon"}
          </p>

          <div className="mt-8 rounded-xl bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-base font-bold text-ink">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-ink">You may also like</h2>
            <Link
              href={`/category/${product.category}`}
              className="text-sm font-semibold text-ink hover:underline"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
