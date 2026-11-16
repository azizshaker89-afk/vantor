import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { toCard } from "@/lib/queries";
import { isLocale } from "@/i18n/dict";

// Hydrates the client-side wishlist (ids only) into card data.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const l = sp.get("l") ?? "ar";
  const ids = (sp.get("ids") ?? "").split(",").filter(Boolean).slice(0, 60);
  if (!isLocale(l) || ids.length === 0) return NextResponse.json([]);
  const rows = await db.product.findMany({ where: { id: { in: ids }, active: true }, include: { brand: true, category: true } });
  const order = new Map(ids.map((id, i) => [id, i]));
  rows.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  return NextResponse.json(rows.map((p) => toCard(p, l)));
}
