"use client";

import { useState } from "react";
import { saveStoreSettings } from "@/app/management/actions";
import type { RuntimeSettings } from "@/lib/settings";

function Toggle({
  name,
  defaultOn,
  label,
  hint,
}: {
  name: string;
  defaultOn: boolean;
  label: string;
  hint?: string;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="text-xs text-ink/50">{hint}</span> : null}
      </span>
      <input type="hidden" name={name} value={on ? "on" : "off"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-brand" : "bg-ink/20"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export function PaymentsSettings({ settings }: { settings: RuntimeSettings }) {
  return (
    <form action={saveStoreSettings} className="mt-6 grid max-w-4xl gap-4 lg:grid-cols-2">
      <input type="hidden" name="redirectTo" value="/management/payments" />
      <input type="hidden" name="carriers" value="" />
      <input type="hidden" name="payOnDelivery" value="off" />
      <input type="hidden" name="whatsappNumber" value={settings.whatsappNumber} />
      <input type="hidden" name="phoneNumber" value={settings.phoneNumber} />
      <input type="hidden" name="contactEmail" value={settings.contactEmail} />
      <input type="hidden" name="depositShare" value={String(settings.depositShare)} />

      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <h2 className="font-display text-lg font-bold">Payments</h2>
        <div className="mt-2 divide-y divide-ink/8">
          <Toggle
            name="payOnOrder"
            defaultOn={settings.payOnOrder}
            label="Pay now (M-Pesa Paybill)"
            hint="Shown at checkout with Paybill steps"
          />
          <Toggle
            name="depositEnabled"
            defaultOn={settings.depositEnabled}
            label={`Pay a deposit · ${Math.round(settings.depositShare * 100)}% now`}
          />
          <Toggle
            name="cashOnDelivery"
            defaultOn={settings.cashOnDelivery}
            label="Cash on delivery"
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Paybill</span>
            <input
              name="paybill"
              defaultValue={settings.paybill}
              className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Account number</span>
            <input
              name="bankAccount"
              defaultValue={settings.bankAccount}
              className="w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl bg-white p-5 ring-1 ring-ink/8">
          <h2 className="font-display text-lg font-bold">Shipping</h2>
          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium">Flat shipping fee</span>
            <div className="flex items-center gap-2">
              <span className="text-ink/50">KES</span>
              <input
                name="shippingFlatKes"
                defaultValue={settings.shippingFlatKes}
                className="w-28 rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </label>
          <p className="mt-3 text-xs text-ink/50">
            Shipping partners are arranged by the store and confirmed with the customer privately —
            they are not shown on the website.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Save payments & shipping
        </button>
      </section>
    </form>
  );
}
