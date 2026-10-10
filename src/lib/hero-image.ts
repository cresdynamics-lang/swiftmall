import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { ensureUploadDir } from "@/lib/uploads";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Save an admin-uploaded hero background as compressed WebP under /uploads/hero
 * so production can serve it without a next start restart.
 */
export async function saveHeroImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const type = (file.type || "image/jpeg").toLowerCase();
  if (!ALLOWED.has(type)) {
    throw new Error("Hero image must be JPG, PNG or WebP");
  }
  if (file.size > MAX_BYTES) throw new Error("Hero image must be 8MB or smaller");

  const input = Buffer.from(await file.arrayBuffer());
  let compressed: Buffer;
  try {
    compressed = await sharp(input)
      .rotate()
      .resize({
        width: 1600,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 72, effort: 4 })
      .toBuffer();
  } catch {
    throw new Error("Could not read that hero image — try a different JPG or PNG");
  }

  const filename = `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const dir = await ensureUploadDir("hero");
  await writeFile(join(dir, filename), compressed);
  return `/uploads/hero/${filename}`;
}
