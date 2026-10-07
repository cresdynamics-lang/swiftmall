import { requireAdmin } from "@/app/management/actions";
import { prisma } from "@/lib/db";
import { formatKes } from "@/lib/format";

export default async function AdminCustomersPage() {
  await requireAdmin();

  const customers = await prisma.customer.findMany({
    include: {
      orders: { select: { total: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <p className="mt-1 text-sm text-ink/55">
        Saved from checkout. Guest shoppers appear here after their first order.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-ink/8">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.03] text-[11px] uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-3 py-3">Customer</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">County</th>
              <th className="px-3 py-3">Orders</th>
              <th className="px-3 py-3">Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const spent = c.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="px-3 py-3 font-medium">{c.name}</td>
                  <td className="px-3 py-3 text-ink/70">{c.phone}</td>
                  <td className="px-3 py-3 text-ink/70">{c.email}</td>
                  <td className="px-3 py-3">{c.county ?? "—"}</td>
                  <td className="px-3 py-3">{c.orders.length}</td>
                  <td className="px-3 py-3 font-semibold">{formatKes(spent)}</td>
                </tr>
              );
            })}
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-ink/45">
                  No customers yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
