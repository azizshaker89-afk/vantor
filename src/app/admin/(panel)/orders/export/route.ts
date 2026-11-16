import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { orderWhere } from "@/lib/admin-orders";
import { GOVERNORATES } from "@/lib/egypt";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Quote, and neutralise spreadsheet formula injection.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  const u = await currentUser();
  if (u?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 });
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const rows = await db.order.findMany({ where: orderWhere(sp), orderBy: { createdAt: "desc" }, include: { items: true } });
  const head = ["number", "date", "status", "name", "phone", "email", "governorate", "city", "address", "payment", "items", "subtotal", "discount", "coupon", "shipping", "total"];
  const lines = rows.map((o) => [
    o.number, o.createdAt.toISOString(), o.status, o.name, o.phone, o.email, GOVERNORATES.find((g) => g.id === o.governorate)?.en ?? o.governorate,
    o.city, o.address, o.payment, o.items.map((i) => `${i.nameEn} x${i.qty}`).join(" | "), o.subtotal, o.discount, o.couponCode, o.shipping, o.total,
  ].map(cell).join(","));
  // BOM so Excel opens Arabic text correctly.
  return new NextResponse("﻿" + [head.join(","), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vantor-orders-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
