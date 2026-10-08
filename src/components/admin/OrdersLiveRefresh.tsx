"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Soft-poll so newly placed orders appear without a manual reload. */
export function OrdersLiveRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
