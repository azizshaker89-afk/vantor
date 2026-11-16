import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/dict";
import { suggest } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const lp = req.nextUrl.searchParams.get("l") ?? "ar";
  const l = isLocale(lp) ? lp : "ar";
  const items = await suggest(q, l);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=30" } });
}
