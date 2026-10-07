import { requireAdmin } from "@/app/management/actions";
import { PaymentsSettings } from "@/components/admin/PaymentsSettings";
import { getStoreSettings } from "@/lib/settings";

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Payments & shipping</h1>
      <p className="mt-1 text-sm text-ink/55">
        Saved to the database and used by checkout and cart shipping.
      </p>
      <PaymentsSettings settings={settings} />
    </main>
  );
}
