import Image from "next/image";
import Link from "next/link";
import { deleteProduct, requireAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { discountPercent, formatKes, offerTagLabel } from "@/lib/format";
import { listAllProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await listAllProducts();

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Products ({products.length})</h1>
            <p className="mt-1 text-sm text-ink/55">
              Edits here update price, discount %, offer tags, and what shoppers see.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
          >
            + Add product
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-ink/8">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-ink/[0.03] text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Offer</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3">Live</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const pct = discountPercent(p.price, p.oldPrice);
                const tag = offerTagLabel(p);
                return (
                  <tr key={p.id} className="border-b border-ink/5">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded bg-ink/[0.04]">
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{p.name}</p>
                          <p className="text-xs text-ink/45">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink/70">{p.categoryName ?? p.category}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{formatKes(p.price)}</p>
                      {p.oldPrice ? (
                        <p className="text-xs text-ink/40 line-through">
                          {formatKes(p.oldPrice)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {pct != null ? (
                          <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-brand">
                            -{pct}%
                          </span>
                        ) : null}
                        {tag ? (
                          <span className="rounded bg-brand/30 px-1.5 py-0.5 text-[10px] font-bold">
                            {tag}
                          </span>
                        ) : (
                          <span className="text-xs text-ink/35">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">{p.stock}</td>
                    <td className="px-3 py-3">{p.live ? "Yes" : "No"}</td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="mr-2 text-sm font-semibold text-ink underline"
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
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
