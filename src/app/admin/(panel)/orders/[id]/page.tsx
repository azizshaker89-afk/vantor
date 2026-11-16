import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Mail, Phone, User } from "lucide-react";
import { db } from "@/lib/db";
import { getDict } from "@/i18n/dict";
import { money } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/ui";
import { OrderDetail } from "@/components/order/OrderDetail";
import { StatusControl } from "@/components/admin/StatusControl";
import { Logo } from "@/components/ui/Logo";

const t = getDict("ar");

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const o = await db.order.findUnique({ where: { id: (await params).id }, select: { number: true } });
  return { title: o ? `طلب ${o.number}` : "طلب" };
}

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, user: { select: { id: true, name: true, _count: { select: { orders: true } } } } } });
  if (!order) notFound();
  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-ink print:hidden"><ArrowRight className="size-4" />كل الطلبات</Link>
      {/* Invoice header only appears on paper */}
      <div className="mb-6 hidden items-center justify-between border-b border-line pb-4 print:flex"><Logo /><p className="text-sm">فاتورة — hello@vantor.store — 0100 000 0000</p></div>
      <PageTitle title={`طلب ${order.number}`} actions={<StatusControl id={order.id} status={order.status} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <OrderDetail order={order} t={t} l="ar" />
        <div className="space-y-6 print:hidden">
          <Card title="العميل">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><User className="size-4 text-brass" />{order.user ? <Link href={`/admin/customers/${order.user.id}`} className="font-semibold hover:text-brass-deep">{order.name}</Link> : <>{order.name} <span className="text-xs text-smoke">(زائر)</span></>}</li>
              <li className="flex items-center gap-2"><Phone className="size-4 text-brass" /><a href={`tel:${order.phone}`} dir="ltr" className="hover:text-brass-deep">{order.phone}</a></li>
              {order.email && <li className="flex items-center gap-2"><Mail className="size-4 text-brass" /><a href={`mailto:${order.email}`} className="hover:text-brass-deep">{order.email}</a></li>}
            </ul>
            {order.user && <p className="mt-4 border-t border-line pt-3 text-xs text-smoke">{order.user._count.orders} طلب من الحساب ده</p>}
            <a href={`https://wa.me/2${order.phone}?text=${encodeURIComponent(`أهلًا ${order.name}، بخصوص طلبك ${order.number} من VANTOR بإجمالي ${money(order.total, "ar")}`)}`} target="_blank" rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] py-2.5 text-sm font-semibold text-white hover:brightness-95">تأكيد على واتساب</a>
          </Card>
          {order.notes && <Card title="ملاحظات العميل"><p className="text-sm leading-7">{order.notes}</p></Card>}
        </div>
      </div>
    </>
  );
}
