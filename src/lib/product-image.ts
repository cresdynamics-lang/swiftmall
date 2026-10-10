import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-types";
import { ensureUploadDir } from "@/lib/uploads";

export { MAX_PRODUCT_IMAGES };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Save an admin-uploaded product photo under /uploads/products (not /public)
 * so production can serve it immediately without restarting next start.
 */
export async function saveProductImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const type = (file.type || "image/jpeg").toLowerCase();
  if (!ALLOWED.has(type)) {
    throw new Error("Image must be JPG, PNG or WebP");
  }
  if (file.size > MAX_BYTES) throw new Error("Image must be 5MB or smaller");

  const input = Buffer.from(await file.arrayBuffer());
  let compressed: Buffer;
  try {
    compressed = await sharp(input)
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new Error("Could not read that image — try a different JPG or PNG");
  }

  const filename = `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.jpg`;
  const dir = await ensureUploadDir("products");
  await writeFile(join(dir, filename), compressed);
  return `/uploads/products/${filename}`;
}

/** Save several angle photos; skips empty file entries. */
export async function saveProductImageFiles(files: File[]): Promise<string[]> {
  const saved: string[] = [];
  for (const file of files) {
    const path = await saveProductImageFile(file);
    if (path) saved.push(path);
  }
  return saved;
}
