import Link from "next/link";
import { requireAdmin } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";
import { storeConfig } from "@/lib/store-config";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [productCount, liveCount, lowStock, flashCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { live: true } }),
    prisma.product.count({ where: { stock: { lte: 3 } } }),
    prisma.product.count({ where: { flashDeal: true } }),
  ]);

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/55">
          {storeConfig.name} · {storeConfig.domain} · shipping {formatKes(storeConfig.shippingFlatKes)}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Products", value: productCount },
            { label: "Live on store", value: liveCount },
            { label: "Flash deals", value: flashCount },
            { label: "Low stock", value: lowStock },
          ].map((t) => (
            <div key={t.label} className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                {t.label}
              </p>
              <p className="mt-2 font-display text-3xl font-bold">{t.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Manage products
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-md border border-ink/15 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            + Add product
          </Link>
        </div>
      </main>
    </>
  );
}
