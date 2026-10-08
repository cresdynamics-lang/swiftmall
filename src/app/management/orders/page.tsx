import { requireAdmin } from "@/app/management/actions";
import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { OrdersLiveRefresh } from "@/components/admin/OrdersLiveRefresh";
import { toAdminOrderView } from "@/lib/admin-orders-view";
import { getOrderStats, listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const [orders, stats] = await Promise.all([listOrders("all"), getOrderStats()]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <OrdersLiveRefresh />
      <OrdersBoard
        orders={orders.map(toAdminOrderView)}
        stats={stats}
      />
    </main>
  );
}
