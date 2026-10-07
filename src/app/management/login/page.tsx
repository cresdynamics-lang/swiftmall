import Link from "next/link";
import { adminLogin } from "@/app/management/actions";
import { Logo } from "@/components/layout/Logo";
import { storeConfig } from "@/lib/store-config";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-xl bg-ink p-6 text-white shadow-lg">
        <Logo />
        <h1 className="mt-4 font-display text-xl font-bold">{storeConfig.adminTitle}</h1>
        <p className="mt-1 text-sm text-white/60">{storeConfig.domain}</p>
        <form action={adminLogin} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-white/80">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full rounded-md border-0 bg-white px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-brand"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-white/80">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border-0 bg-white px-3 py-2.5 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand"
              placeholder="Password"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-300">Wrong email or password. Try again.</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Sign in
          </button>
        </form>
      </div>
      <Link href="/" className="mt-4 text-center text-sm text-ink/55 hover:text-ink">
        ← Back to store
      </Link>
    </div>
  );
}
