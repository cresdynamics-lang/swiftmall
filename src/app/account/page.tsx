import Link from "next/link";
import { customerLogin, customerLogout } from "@/app/account/actions";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatKes } from "@/lib/format";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/orders";
import { prisma } from "@/lib/db";

export const metadata = { title: "Account" };

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function AccountPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const customer = await getCustomerSession();

  if (customer) {
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return (
      <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
        <h1 className="font-display text-2xl font-bold text-ink">My account</h1>
        <p className="mt-2 text-sm text-ink/55">
          Signed in as <strong>{customer.email}</strong>
        </p>

        <div className="mt-6 space-y-3">
          <h2 className="font-display text-base font-bold text-ink">Your orders</h2>
          {orders.length === 0 ? (
            <p className="rounded-xl bg-white p-5 text-sm text-ink/55 ring-1 ring-ink/8">
              No orders yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-xl bg-white p-4 text-sm ring-1 ring-ink/8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">Order #{o.number}</p>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {orderStatusLabel[o.status]} · {paymentMethodLabel[o.paymentMethod]}
                      </p>
                    </div>
                    <p className="font-display font-bold">{formatKes(o.total)}</p>
                  </div>
                  <Link
                    href={`/track?order=${o.number}`}
                    className="mt-2 inline-block text-xs font-semibold text-ink hover:underline"
                  >
                    Track →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form action={customerLogout} className="mt-6">
          <button
            type="submit"
            className="rounded-md border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-ink/[0.03]"
          >
            Log out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
      <h1 className="font-display text-2xl font-bold text-ink">Account</h1>
      <p className="mt-2 text-sm text-ink/55">
        Log in with the email and password you created after placing an order.
      </p>
      <form action={customerLogin} className="mt-6 space-y-3 rounded-xl bg-white p-5 ring-1 ring-ink/8">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
            placeholder="••••••••"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600">Wrong email or password. Try again.</p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-md bg-brand py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
        >
          Log in
        </button>
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
