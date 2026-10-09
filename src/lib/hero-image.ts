import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Save an admin-uploaded hero background as a compressed WebP for faster LCP.
 * Resizes to max 1600px wide and targets ~70–75 quality.
 */
export async function saveHeroImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const type = file.type || "image/jpeg";
  if (!ALLOWED.has(type) && type !== "image/jpg") {
    throw new Error("Hero image must be JPG, PNG or WebP");
  }
  if (file.size > MAX_BYTES) throw new Error("Hero image must be 8MB or smaller");

  const input = Buffer.from(await file.arrayBuffer());
  const compressed = await sharp(input)
    .rotate()
    .resize({
      width: 1600,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 72, effort: 4 })
    .toBuffer();

  const filename = `hero-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const dir = join(process.cwd(), "public", "hero", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), compressed);
  return `/hero/uploads/${filename}`;
}
