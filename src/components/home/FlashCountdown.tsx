"use client";

import { useEffect, useState } from "react";

export function useFlashCountdown(endsAt: string | null) {
  const end = endsAt ? new Date(endsAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!Number.isFinite(end) || end <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  if (!Number.isFinite(end)) return null;
  const remaining = Math.max(0, Math.floor((end - now) / 1000));
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return { remaining, h, m, s, ended: remaining <= 0 };
}

function TimeBox({
  value,
  label,
  compact,
  onYellow,
}: {
  value: number;
  label: string;
  compact?: boolean;
  onYellow?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-md font-display ${
        onYellow ? "bg-ink text-brand" : "bg-brand text-ink"
      } ${compact ? "min-w-[36px] px-1.5 py-0.5" : "min-w-[44px] px-2 py-1"}`}
    >
      <span className={`font-bold leading-none ${compact ? "text-sm" : "text-base"}`}>
        {String(value).padStart(2, "0")}
      </span>
      <span
        className={`mt-0.5 font-semibold tracking-wide ${
          compact ? "text-[8px]" : "text-[9px]"
        } ${onYellow ? "text-brand/80" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}

/** Countdown strip — static; only digits update. */
export function FlashCountdown({
  endsAt,
  compact = false,
  variant = "dark",
  className = "",
}: {
  endsAt: string | null;
  compact?: boolean;
  /** onYellow = readable on brand yellow flash panel */
  variant?: "dark" | "onYellow";
  className?: string;
}) {
  const clock = useFlashCountdown(endsAt);
  if (!endsAt || !clock || clock.ended) return null;

  const onYellow = variant === "onYellow";

  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 shadow-sm ${
        onYellow
          ? "bg-ink text-white ring-1 ring-ink/20"
          : "bg-ink/90 text-white ring-1 ring-white/10 backdrop-blur-sm"
      } ${className}`}
      aria-live="polite"
      aria-label="Flash sale ends in"
    >
      <span
        className={`shrink-0 text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${
          onYellow ? "text-brand" : "text-brand"
        }`}
      >
        ⚡ Flash ends
      </span>
      <div className="flex items-center gap-0.5 font-display text-sm font-bold sm:gap-1">
        <TimeBox value={clock.h} label="HRS" compact={compact} onYellow={onYellow} />
        <span className="text-brand">:</span>
        <TimeBox value={clock.m} label="MIN" compact={compact} onYellow={onYellow} />
        <span className="text-brand">:</span>
        <TimeBox value={clock.s} label="SEC" compact={compact} onYellow={onYellow} />
      </div>
    </div>
  );
}
