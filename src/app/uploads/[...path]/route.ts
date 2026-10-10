import { readFile, stat } from "fs/promises";
import { NextResponse } from "next/server";
import { contentTypeFor, resolveUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const { path: parts } = await params;
  const filePath = resolveUploadPath(parts);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }
    const data = await readFile(filePath);
    const name = parts[parts.length - 1] ?? "image.jpg";
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(name),
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
