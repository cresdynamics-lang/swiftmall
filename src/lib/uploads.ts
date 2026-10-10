import { mkdir } from "fs/promises";
import { join, normalize, relative, sep } from "path";

/** Runtime uploads live outside /public so next start can serve them without a restart. */
export function uploadsRoot() {
  return join(process.cwd(), "uploads");
}

export async function ensureUploadDir(...segments: string[]) {
  const dir = join(uploadsRoot(), ...segments);
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Resolve a path under uploads/; returns null if it escapes the root. */
export function resolveUploadPath(parts: string[]): string | null {
  if (!parts.length) return null;
  for (const part of parts) {
    if (!part || part === "." || part === ".." || part.includes("\0") || part.includes("/") || part.includes("\\")) {
      return null;
    }
  }
  const root = uploadsRoot();
  const resolved = normalize(join(root, ...parts));
  const rel = relative(root, resolved);
  if (!rel || rel.startsWith("..") || rel.startsWith(sep) || rel.includes(`..${sep}`)) {
    return null;
  }
  return resolved;
}

export function contentTypeFor(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}
