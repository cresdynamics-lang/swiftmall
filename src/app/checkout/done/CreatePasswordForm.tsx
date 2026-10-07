"use client";

import { useActionState } from "react";
import { createTrackingPassword } from "@/app/account/actions";

async function action(_prev: string | null, formData: FormData): Promise<string | null> {
  try {
    await createTrackingPassword(formData);
    return null;
  } catch (err) {
    const digest = err && typeof err === "object" && "digest" in err ? String(err.digest) : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw err;
    return err instanceof Error ? err.message : "Could not create password";
  }
}

export function CreatePasswordForm({
  email,
  orderNumber,
}: {
  email: string;
  orderNumber: number;
}) {
  const [error, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-8 rounded-xl bg-white p-5 text-left ring-1 ring-ink/8">
      <h2 className="font-display text-lg font-bold text-ink">Create a password to track</h2>
      <p className="mt-1 text-sm text-ink/60">
        Use <strong>{email}</strong> and a password to log in and track this order anytime.
      </p>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium text-ink/80">Password *</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      <label className="mt-3 block text-sm">
        <span className="mb-1 block font-medium text-ink/80">Confirm password *</span>
        <input
          name="confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Create password & track order"}
      </button>
    </form>
  );
}
