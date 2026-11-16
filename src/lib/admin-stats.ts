import "server-only";
import { db } from "./db";
import { GOVERNORATES } from "./egypt";

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const delta = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));

export const RANGES = [7, 30, 90] as const;
export type Range = (typeof RANGES)[number];

/** Everything the overview needs for the last `days` days, compared with the period before it. */
export async function dashboard(days: Range) {
  const today = startOfDay(new Date());
  const from = new Date(today.getTime() - (days - 1) * DAY);
  const prevFrom = new Date(from.getTime() - days * DAY);

  const [orders, customersNow, customersPrev, lowStock, unread, recent] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: prevFrom } },
      select: { id: true, total: true, status: true, governorate: true, createdAt: true, items: { select: { qty: true, price: true, productId: true, nameAr: true, image: true, product: { select: { category: { select: { nameAr: true } } } } } } },
    }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: from } } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: prevFrom, lt: from } } }),
    db.product.findMany({ where: { active: true, stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 6, select: { id: true, nameAr: true, image: true, stock: true } }),
    db.message.count({ where: { read: false } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, number: true, name: true, total: true, status: true, createdAt: true } }),
  ]);

  const cur = orders.filter((o) => o.createdAt >= from);
  const prev = orders.filter((o) => o.createdAt < from);
  const live = (xs: typeof orders) => xs.filter((o) => o.status !== "CANCELLED");
  const sum = (xs: typeof orders) => live(xs).reduce((a, o) => a + o.total, 0);

  const revenue = sum(cur), revenuePrev = sum(prev);
  const count = cur.length, countPrev = prev.length;
  const aov = live(cur).length ? Math.round(revenue / live(cur).length) : 0;
  const aovPrev = live(prev).length ? Math.round(revenuePrev / live(prev).length) : 0;

  // Daily revenue series (zero-filled).
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) byDay.set(dayKey(new Date(from.getTime() + i * DAY)), { revenue: 0, orders: 0 });
  for (const o of live(cur)) {
    const b = byDay.get(dayKey(o.createdAt));
    if (b) { b.revenue += o.total; b.orders += 1; }
  }
  const series = [...byDay].map(([date, v]) => ({ date, ...v }));

  const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => ({ key: s, value: cur.filter((o) => o.status === s).length }));

  const products = new Map<string, { name: string; image: string; units: number; revenue: number }>();
  const categories = new Map<string, number>();
  for (const o of live(cur))
    for (const it of o.items) {
      const p = products.get(it.productId) ?? { name: it.nameAr, image: it.image, units: 0, revenue: 0 };
      p.units += it.qty; p.revenue += it.qty * it.price;
      products.set(it.productId, p);
      const c = it.product.category.nameAr;
      categories.set(c, (categories.get(c) ?? 0) + it.qty * it.price);
    }

  const govs = new Map<string, number>();
  for (const o of live(cur)) govs.set(o.governorate, (govs.get(o.governorate) ?? 0) + 1);

  return {
    days,
    kpis: {
      revenue: { value: revenue, delta: delta(revenue, revenuePrev) },
      orders: { value: count, delta: delta(count, countPrev) },
      aov: { value: aov, delta: delta(aov, aovPrev) },
      customers: { value: customersNow, delta: delta(customersNow, customersPrev) },
    },
    series,
    statuses,
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    categories: [...categories].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    governorates: [...govs].map(([id, value]) => ({ label: GOVERNORATES.find((g) => g.id === id)?.ar ?? id, value })).sort((a, b) => b.value - a.value).slice(0, 6),
    lowStock, unread, recent,
  };
}
