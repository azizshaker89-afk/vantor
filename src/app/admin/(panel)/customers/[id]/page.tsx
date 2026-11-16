import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { getDict } from "@/i18n/dict";
import { money } from "@/lib/format";
import { Card, PageTitle, Table, td } from "@/components/admin/ui";
import { StatusBadge, fmtDate } from "@/components/order/OrderDetail";

const t = getDict("ar");

export default async function Customer({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const u = await db.user.findUnique({ where: { id: (await params).id }, include: { orders: { orderBy: { createdAt: "desc" }, include: { _count: { select: { items: true } } } } } });
  if (!u || u.role !== "CUSTOMER") notFound();
  const live = u.orders.filter((o) => o.status !== "CANCELLED");
  const spent = live.reduce((a, o) => a + o.total, 0);
  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-ink"><ArrowRight className="size-4" />العملاء</Link>
      <PageTitle title={u.name} sub={`عميل من ${fmtDate(u.createdAt, "ar")}`} />
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <Card title="بيانات التواصل">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Mail className="size-4 text-brass" /><a href={`mailto:${u.email}`} className="hover:text-brass-deep">{u.email}</a></li>
            {u.phone && <li className="flex items-center gap-2"><Phone className="size-4 text-brass" /><a href={`tel:${u.phone}`} dir="ltr" className="hover:text-brass-deep">{u.phone}</a></li>}
          </ul>
          <dl className="mt-5 grid grid-cols-2 gap-px border border-line bg-line text-center">
            <div className="bg-bone p-3"><dt className="text-xs text-smoke">الطلبات</dt><dd className="mt-1 font-display text-xl">{u.orders.length}</dd></div>
            <div className="bg-bone p-3"><dt className="text-xs text-smoke">المتوسط</dt><dd className="mt-1 font-display text-xl tabular-nums">{live.length ? money(Math.round(spent / live.length), "ar") : "—"}</dd></div>
            <div className="col-span-2 bg-bone p-3"><dt className="text-xs text-smoke">إجمالي المشتريات</dt><dd className="mt-1 font-display text-2xl tabular-nums">{money(spent, "ar")}</dd></div>
          </dl>
        </Card>
        <Table head={["الطلب", "التاريخ", "القطع", "الإجمالي", "الحالة"]} empty={!u.orders.length}>
          {u.orders.map((o) => (
            <tr key={o.id} className="hover:bg-stone/40">
              <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brass-deep" dir="ltr">{o.number}</Link></td>
              <td className={`${td} text-smoke`}>{fmtDate(o.createdAt, "ar")}</td>
              <td className={`${td} tabular-nums`}>{o._count.items}</td>
              <td className={`${td} tabular-nums`}>{money(o.total, "ar")}</td>
              <td className={td}><StatusBadge status={o.status} t={t} /></td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  );
}
