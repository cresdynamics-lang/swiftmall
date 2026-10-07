import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { storeConfig } from "@/lib/store-config";

export const metadata: Metadata = {
  title: storeConfig.adminTitle,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
