"use client";

import { useState } from "react";

export function BannerHeroImageField({
  currentImage,
}: {
  currentImage?: string | null;
}) {
  const [preview, setPreview] = useState(currentImage ?? "");

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Hero background image</span>
        <input
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full rounded-md border border-ink/15 px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPreview(URL.createObjectURL(file));
          }}
        />
      </label>
      <p className="text-xs text-ink/50">
        Upload JPG / PNG / WebP. Saved as compressed WebP (max ~1600px) so the homepage loads
        faster. Matches the department selected below.
      </p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-36 w-full rounded-md object-cover ring-1 ring-ink/10"
        />
      ) : (
        <p className="text-xs text-ink/45">No custom hero image yet — static slide art is used.</p>
      )}
    </div>
  );
}
