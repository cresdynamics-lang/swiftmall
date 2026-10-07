import Link from "next/link";
import { adminLogout } from "@/app/admin/actions";
import { Logo } from "@/components/layout/Logo";
import { storeConfig } from "@/lib/store-config";

export function AdminNav() {
  return (
    <header className="border-b border-ink/10 bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Logo />
          <div>
            <p className="font-display text-sm font-bold">{storeConfig.adminTitle}</p>
            <p className="text-[11px] text-white/50">{storeConfig.domain}</p>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/admin" className="hover:text-brand">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:text-brand">
            Products
          </Link>
          <Link href="/" className="hover:text-brand">
            View store
          </Link>
          <form action={adminLogout}>
            <button type="submit" className="rounded bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
