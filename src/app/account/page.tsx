import Link from "next/link";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Account</h1>
      <p className="mt-2 text-sm text-ink/55">
        Guest checkout is always available. Create an account to save addresses and order history.
      </p>
      <form className="mt-6 space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone or email</span>
          <input
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
            placeholder="07XX XXX XXX"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input
            type="password"
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
            placeholder="••••••••"
          />
        </label>
        <button
          type="button"
          className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Log in
        </button>
        <Link href="/checkout" className="block text-center text-sm font-medium text-ink/70">
          or Continue as guest
        </Link>
      </form>
      <ul className="mt-6 space-y-2 text-sm text-ink/70">
        <li>
          <Link href="/saved" className="hover:text-ink">
            Saved items →
          </Link>
        </li>
        <li>
          <Link href="/track" className="hover:text-ink">
            Track my order →
          </Link>
        </li>
      </ul>
    </div>
  );
}
