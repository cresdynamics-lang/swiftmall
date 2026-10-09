import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/** Save an admin-uploaded product photo into /public/products and return its public path. */
export async function saveProductImageFile(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const type = file.type || "image/jpeg";
  if (!ALLOWED.has(type) && !ALLOWED.has(type.replace("image/jpg", "image/jpeg"))) {
    throw new Error("Image must be JPG, PNG or WebP");
  }
  if (file.size > MAX_BYTES) throw new Error("Image must be 5MB or smaller");

  const ext =
    type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  const filename = `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const dir = join(process.cwd(), "public", "products");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/products/${filename}`;
}
