import Link from "next/link";
import { requireAdmin } from "@/app/management/actions";
import { toAdminOrderView } from "@/lib/admin-orders-view";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";
import { getOrderStats, listOrders } from "@/lib/orders";
import { storeConfig } from "@/lib/store-config";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [productCount, liveCount, stats, latest] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { live: true } }),
    getOrderStats(),
    listOrders("all"),
  ]);

  const latestViews = latest.slice(0, 5).map(toAdminOrderView);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink/55">
        {storeConfig.name} · live catalogue and orders from Postgres
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Orders today", value: String(stats.ordersToday), href: "/management/orders" },
          { label: "Sales today", value: formatKes(stats.salesToday), href: "/management/orders" },
          { label: "To dispatch", value: String(stats.toDispatch), href: "/management/orders" },
          { label: "Low stock", value: String(stats.lowStock), href: "/management/products" },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-xl bg-white p-5 ring-1 ring-ink/8 transition hover:ring-brand"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
              {t.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Catalogue</p>
          <p className="mt-2 font-display text-2xl font-bold">{productCount}</p>
          <p className="mt-1 text-sm text-ink/55">{liveCount} live on store</p>
        </div>
        <Link
          href="/management/orders"
          className="rounded-xl bg-ink p-5 text-white transition hover:bg-ink/90"
        >
          <p className="font-display text-lg font-bold">Orders</p>
          <p className="mt-1 text-sm text-white/65">
            New checkouts land here with payment method and pack actions.
          </p>
        </Link>
        <Link
          href="/management/products"
          className="rounded-xl bg-brand p-5 text-ink transition hover:bg-brand-dark"
        >
          <p className="font-display text-lg font-bold">Products</p>
          <p className="mt-1 text-sm text-ink/70">
            Stock falls when orders are placed. Live toggle hides from the shop.
          </p>
        </Link>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Latest orders</h2>
          <Link href="/management/orders" className="text-sm font-semibold text-ink/60 hover:text-ink">
            See all →
          </Link>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-ink/8">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink/10 text-[11px] uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {latestViews.map((o) => (
                <tr key={o.id} className="border-b border-ink/5">
                  <td className="px-3 py-3 font-semibold">#{o.number}</td>
                  <td className="px-3 py-3">{o.customer}</td>
                  <td className="px-3 py-3 text-ink/70">{o.payment}</td>
                  <td className="px-3 py-3">{formatKes(o.total)}</td>
                  <td className="px-3 py-3">{o.statusLabel}</td>
                </tr>
              ))}
              {latestViews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-ink/45">
                    No orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
