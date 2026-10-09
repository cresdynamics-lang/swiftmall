import { requireAdmin } from "@/app/management/actions";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";
import { REPORT_PERIODS, rangeForPeriod } from "@/lib/report-periods";

export default async function AdminReportsPage() {
  await requireAdmin();

  const [orders, lowStock, byCountyRows, productCount] = await Promise.all([
    prisma.order.findMany({ select: { total: true, county: true, createdAt: true } }),
    prisma.product.findMany({
      where: { stock: { lte: 3 } },
      orderBy: { stock: "asc" },
      take: 10,
      select: { name: true, stock: true },
    }),
    prisma.order.groupBy({
      by: ["county"],
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _count: { county: "desc" } },
    }),
    prisma.product.count({ where: { live: true } }),
  ]);

  const totalSales = orders.reduce((s, o) => s + o.total, 0);

  const periodCounts = await Promise.all(
    REPORT_PERIODS.map(async (p) => {
      const { from, to } = rangeForPeriod(p.id);
      const count = await prisma.order.count({
        where: { createdAt: { gte: from, lte: to } },
      });
      const sum = await prisma.order.aggregate({
        where: { createdAt: { gte: from, lte: to } },
        _sum: { total: true },
      });
      return { ...p, count, sales: sum._sum.total ?? 0 };
    }),
  );

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-ink/55">
            Live totals from the orders and products tables.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">All-time sales</p>
          <p className="mt-2 font-display text-3xl font-bold">{formatKes(totalSales)}</p>
          <p className="mt-1 text-sm text-ink/50">
            {orders.length} orders · {productCount} live products
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Orders by county</h2>
          <ul className="mt-3 space-y-2">
            {byCountyRows.map((row) => (
              <li key={row.county} className="flex justify-between text-sm">
                <span>{row.county}</span>
                <span className="font-semibold">
                  {row._count._all} · {formatKes(row._sum.total ?? 0)}
                </span>
              </li>
            ))}
            {byCountyRows.length === 0 ? (
              <li className="text-sm text-ink/45">No orders yet.</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:col-span-3">
          <h2 className="font-display text-lg font-bold">Low stock</h2>
          <ul className="mt-3 divide-y divide-ink/8">
            {lowStock.map((p) => (
              <li key={p.name} className="flex justify-between py-2 text-sm">
                <span>{p.name}</span>
                <span className="font-semibold text-red-600">{p.stock} left</span>
              </li>
            ))}
            {lowStock.length === 0 ? (
              <li className="py-2 text-sm text-ink/45">No low-stock products.</li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8 lg:col-span-3">
          <h2 className="font-display text-lg font-bold">Export report</h2>
          <p className="mt-1 text-sm text-ink/55">
            Download a CSV of orders, county totals and line items for the selected period.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {periodCounts.map((p) => (
              <a
                key={p.id}
                href={`/management/reports/export?period=${p.id}`}
                className="rounded-lg border border-ink/10 bg-ink/[0.02] p-4 transition hover:border-brand hover:bg-brand/10"
              >
                <p className="font-semibold text-ink">{p.label}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {p.count} orders · {formatKes(p.sales)}
                </p>
                <p className="mt-3 text-sm font-semibold text-ink underline">Download CSV</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
