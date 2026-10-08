import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product/ProductActions";
import {
  ProductRecentlyViewed,
  ProductRail,
  ProductWhatsAppOrder,
  ShopOtherDepartments,
} from "@/components/product/ProductExtras";
import { TrackView } from "@/components/product/TrackView";
import { listStoreCategories, getStoreCategory } from "@/lib/categories-db";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import { getProduct, getProductsByCategory, listLiveProducts } from "@/lib/products";
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

  const [cat, categories, allLive] = await Promise.all([
    getStoreCategory(product.category),
    listStoreCategories(),
    listLiveProducts(),
  ]);

  const discount = discountPercent(product.price, product.oldPrice);
  const promo = offerTagLabel(product);
  const save =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : null;

  const othersLike = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const mightLike = allLive
    .filter((p) => p.id !== product.id && p.category !== product.category)
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
            {product.sku ? ` · Code: ${product.sku}` : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {product.oldPrice ? (
              <span className="text-lg text-ink/35 line-through">
                {formatKes(product.oldPrice)}
              </span>
            ) : null}
            <span className="font-display text-3xl font-bold text-ink">
              {formatKes(product.price)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm">
            {save != null ? (
              <span className="font-semibold text-ink">
                Save {formatKes(save)}
                {discount != null ? ` (-${discount}%)` : ""}
              </span>
            ) : null}
            <span className={product.stock > 0 ? "text-stock" : "text-red-600"}>
              {product.stock > 0 ? "In stock" : "Out of stock"}
            </span>
          </div>
          <p className="mt-2 text-sm text-ink/55">
            Plus KES {storeConfig.shippingFlatKes} shipping at checkout · Cash on delivery available
          </p>

          <ProductActions
            productId={product.id}
            stock={product.stock}
            sizes={product.sizes}
          />

          <ProductWhatsAppOrder
            productName={product.name}
            priceLabel={formatKes(product.price)}
          />

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {(Object.keys(paymentLabels) as Array<keyof typeof paymentLabels>).map((key) => (
              <div key={key} className="rounded-lg bg-white p-3 ring-1 ring-ink/8">
                <p className="text-sm font-semibold text-ink">{paymentLabels[key].title}</p>
                <p className="mt-0.5 text-xs text-ink/55">{paymentLabels[key].hint}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-ink/45">
            M-Pesa Paybill {storeConfig.payments.paybill} · A/C{" "}
            {storeConfig.payments.bankAccount} · WhatsApp / Call {storeConfig.whatsappNumber}
          </p>

          <div className="mt-8 rounded-xl bg-white p-5 ring-1 ring-ink/8">
            <h2 className="font-display text-base font-bold text-ink">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{product.description}</p>
          </div>
        </div>
      </div>

      <ProductRail
        title="What others like"
        products={othersLike}
        seeAllHref={`/category/${product.category}`}
      />

      <ProductRecentlyViewed excludeId={product.id} />

      <ProductRail title="What you might like" products={mightLike} seeAllHref="/deals" />

      <ShopOtherDepartments categories={categories} currentSlug={product.category} />
    </div>
  );
}
