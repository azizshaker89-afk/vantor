import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// Uploaded images live outside /public (files added there after `next build` aren't served by `next start`).
const ROOT = path.join(process.cwd(), "uploads");

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (parts.some((p) => !/^[\w.-]+$/.test(p) || p.startsWith("."))) return new NextResponse(null, { status: 404 });
  const file = path.join(ROOT, ...parts);
  if (!file.startsWith(ROOT + path.sep) || !file.endsWith(".webp")) return new NextResponse(null, { status: 404 });
  try {
    const buf = await fs.readFile(file);
    return new NextResponse(new Uint8Array(buf), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
