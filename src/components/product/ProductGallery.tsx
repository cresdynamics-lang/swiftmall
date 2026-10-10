"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { angleLabel } from "@/lib/product-angles";

export function ProductGallery({
  images,
  name,
  badges,
}: {
  images: string[];
  name: string;
  badges?: React.ReactNode;
}) {
  const photos = images.length ? images : ["/brand/favicon-32.png"];
  const [active, setActive] = useState(0);
  const safeIndex = Math.min(active, photos.length - 1);
  const current = photos[safeIndex] ?? photos[0];
  const label = angleLabel(safeIndex);

  useEffect(() => {
    setActive(0);
  }, [photos.join("|")]);

  function go(delta: number) {
    setActive((i) => (i + delta + photos.length) % photos.length);
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
        <Image
          key={current}
          src={current}
          alt={`${name} — ${label}`}
          fill
          className="object-contain p-3 sm:p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {badges ? (
          <div className="absolute left-3 top-3 flex flex-col gap-1">{badges}</div>
        ) : null}
        <span className="absolute bottom-3 left-3 rounded bg-ink/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {label}
        </span>
        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous angle"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-ink shadow ring-1 ring-ink/10 hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next angle"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-lg font-bold text-ink shadow ring-1 ring-ink/10 hover:bg-white"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Product angles">
          {photos.map((src, i) => {
            const on = i === safeIndex;
            const thumbLabel = angleLabel(i);
            return (
              <li key={`${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View ${thumbLabel}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative aspect-square w-full overflow-hidden rounded-md bg-white ring-1 transition ${
                    on ? "ring-2 ring-brand" : "ring-ink/10 hover:ring-ink/25"
                  }`}
                >
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="80px"
                  />
                  <span
                    className={`absolute inset-x-0 bottom-0 truncate px-0.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide ${
                      on ? "bg-brand text-ink" : "bg-ink/70 text-white"
                    }`}
                  >
                    {thumbLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
