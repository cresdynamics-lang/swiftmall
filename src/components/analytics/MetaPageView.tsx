"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { trackMeta } from "@/lib/meta-pixel";

function MetaPageViewInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    if (pathname?.startsWith("/management")) return;
    // Initial PageView is fired by the base pixel snippet.
    if (first.current) {
      first.current = false;
      return;
    }
    trackMeta("PageView");
  }, [pathname, searchParams]);

  return null;
}

/** Fires PageView on client navigations (App Router). */
export function MetaPageView() {
  return (
    <Suspense fallback={null}>
      <MetaPageViewInner />
    </Suspense>
  );
}
