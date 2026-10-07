import type { Metadata } from "next";
import { storeConfig } from "@/lib/store-config";

export const metadata: Metadata = {
  title: storeConfig.adminTitle,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f3f3] text-ink">
      {children}
    </div>
  );
}
