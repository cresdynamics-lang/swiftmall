"use client";

import Image from "next/image";
import { useState } from "react";

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
  const current = photos[Math.min(active, photos.length - 1)] ?? photos[0];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
        <Image
          src={current}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {badges ? (
          <div className="absolute left-3 top-3 flex flex-col gap-1">{badges}</div>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" aria-label="Product angles">
          {photos.map((src, i) => {
            const on = i === active;
            return (
              <li key={`${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View angle ${i + 1}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative aspect-square w-full overflow-hidden rounded-md bg-white ring-1 transition ${
                    on ? "ring-2 ring-brand" : "ring-ink/10 hover:ring-ink/25"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
