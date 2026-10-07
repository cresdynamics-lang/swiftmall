"use client";

import { useEffect } from "react";
import { useViewed } from "@/context/ViewedContext";

export function TrackView({ productId }: { productId: string }) {
  const { track } = useViewed();

  useEffect(() => {
    track(productId);
  }, [productId, track]);

  return null;
}
