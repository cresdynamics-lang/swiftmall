import Link from "next/link";
import { requireAdmin, saveStoreSettings } from "@/app/management/actions";
import { getStoreSettings } from "@/lib/settings";
import { storeConfig } from "@/lib/store-config";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink/55">Contact details and staff roles.</p>

      <form
        action={saveStoreSettings}
        className="mt-6 max-w-xl space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink/8"
      >
        <input type="hidden" name="redirectTo" value="/management/settings" />
        <input type="hidden" name="shippingFlatKes" value={settings.shippingFlatKes} />
        <input type="hidden" name="depositShare" value={String(settings.depositShare)} />
        <input type="hidden" name="payOnOrder" value={settings.payOnOrder ? "on" : "off"} />
        <input type="hidden" name="depositEnabled" value={settings.depositEnabled ? "on" : "off"} />
        <input type="hidden" name="cashOnDelivery" value={settings.cashOnDelivery ? "on" : "off"} />
        <input type="hidden" name="payOnDelivery" value={settings.payOnDelivery ? "on" : "off"} />
        <input type="hidden" name="carriers" value={settings.carriers.join("|")} />
        <input type="hidden" name="paybill" value={settings.paybill} />
        <input type="hidden" name="bankAccount" value={settings.bankAccount} />

        <h2 className="font-display text-lg font-bold">Contact</h2>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">WhatsApp / Call</span>
          <input
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone</span>
          <input
            name="phoneNumber"
            defaultValue={settings.phoneNumber}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Orders email</span>
          <input
            name="contactEmail"
            defaultValue={settings.contactEmail}
            className="w-full rounded-md border border-ink/15 px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Flash deals end (local time)</span>
          <input
            name="flashEndsAt"
            type="datetime-local"
            defaultValue={
              settings.flashEndsAt
                ? new Date(settings.flashEndsAt.getTime() - settings.flashEndsAt.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            className="w-full rounded-md border border-ink/15 px-3 py-2.5"
          />
          <span className="mt-1 block text-xs text-ink/45">
            Countdown uses this real end time. Clear and save to hide flash deals.
          </span>
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Save settings
        </button>
      </form>

      <section className="mt-6 max-w-xl rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <h2 className="font-display text-lg font-bold">Staff roles</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex justify-between">
            <span>Martin</span>
            <span className="text-ink/50">Owner · full access · sales · settings</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-ink/45">
          Store: {storeConfig.name} · {storeConfig.domain}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/management/payments" className="hover:underline">
            Payments & shipping →
          </Link>
          <Link href="/management/banners" className="hover:underline">
            Banners →
          </Link>
        </div>
      </section>
    </main>
  );
}
