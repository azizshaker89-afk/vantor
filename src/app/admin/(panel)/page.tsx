import { requireAdmin } from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Mail } from "lucide-react";
import { dashboard, RANGES, type Range } from "@/lib/admin-stats";
import { getDict } from "@/i18n/dict";
import { money } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { BarList } from "@/components/admin/BarList";
import { StatusBadge, fmtDate } from "@/components/order/OrderDetail";

export const metadata = { title: "نظرة عامة" };
const t = getDict("ar");
const egp = (v: number) => money(v, "ar");

export default async function Overview({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const r = Number((await searchParams).range);
  const days: Range = (RANGES as readonly number[]).includes(r) ? (r as Range) : 30;
  const d = await dashboard(days);

  const kpis = [
    { label: "الإيراد", value: egp(d.kpis.revenue.value), delta: d.kpis.revenue.delta },
    { label: "الطلبات", value: String(d.kpis.orders.value), delta: d.kpis.orders.delta },
    { label: "متوسط قيمة الطلب", value: egp(d.kpis.aov.value), delta: d.kpis.aov.delta },
    { label: "عملاء جدد", value: String(d.kpis.customers.value), delta: d.kpis.customers.delta },
  ];

  return (
    <>
      <PageTitle
        title="نظرة عامة"
        sub={`أداء المتجر في آخر ${days} يوم مقارنة بالفترة اللي قبلها`}
        actions={
          <div className="flex border border-line bg-bone p-0.5 text-sm" role="group" aria-label="الفترة">
            {RANGES.map((x) => (
              <Link key={x} href={`/admin?range=${x}`} aria-current={x === days ? "true" : undefined}
                className={`px-3.5 py-1.5 ${x === days ? "bg-onyx text-bone" : "text-smoke hover:text-ink"}`}>{x} يوم</Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-px border border-line bg-line xl:grid-cols-4">
        {kpis.map((k) => {
          const up = k.delta >= 0;
          return (
            <div key={k.label} className="bg-bone p-5">
              <p className="text-sm text-smoke">{k.label}</p>
              <p className="mt-2 font-display text-2xl tabular-nums md:text-[1.7rem]">{k.value}</p>
              <p className={`mt-1 flex items-center gap-1 text-xs ${up ? "text-[#3c6b3f]" : "text-sale"}`}>
                {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                <span dir="ltr" className="tabular-nums">{up ? "+" : ""}{k.delta}%</span>
                <span className="text-smoke">عن الفترة السابقة</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card title="الإيراد اليومي"><RevenueChart data={d.series} /></Card>
        <Card title="حالة الطلبات">
          <BarList label="حالة الطلبات" items={d.statuses.map((s) => ({ label: t.order.statuses[s.key], value: s.value }))} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="الأكثر مبيعًا" pad={false}>
          {d.topProducts.length ? (
            <ol className="divide-y divide-line">
              {d.topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-4 text-xs tabular-nums text-smoke">{i + 1}</span>
                  <div className="relative size-10 shrink-0 bg-onyx"><Image src={p.image} alt="" fill sizes="40px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate">{p.name}</p><p className="text-xs text-smoke">{p.units} قطعة</p></div>
                  <span className="tabular-nums">{egp(p.revenue)}</span>
                </li>
              ))}
            </ol>
          ) : <p className="p-6 text-center text-sm text-smoke">مفيش مبيعات في الفترة دي.</p>}
        </Card>
        <Card title="المبيعات حسب القسم"><BarList label="المبيعات حسب القسم" items={d.categories} format={egp} /></Card>
        <Card title="أكتر المحافظات طلبًا"><BarList label="الطلبات حسب المحافظة" items={d.governorates} format={(v) => `${v} طلب`} /></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card title="أحدث الطلبات" pad={false} action={<Link href="/admin/orders" className="text-xs font-semibold text-brass-deep hover:text-ink">كل الطلبات</Link>}>
          <ul className="divide-y divide-line">
            {d.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-stone/50">
                  <span className="w-20 font-semibold" dir="ltr">{o.number}</span>
                  <span className="min-w-0 flex-1 truncate">{o.name}</span>
                  <span className="text-xs text-smoke">{fmtDate(o.createdAt, "ar")}</span>
                  <StatusBadge status={o.status} t={t} />
                  <span className="w-24 text-end tabular-nums">{egp(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card title="مخزون قرب يخلص" pad={false}>
            {d.lowStock.length ? (
              <ul className="divide-y divide-line">
                {d.lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-stone/50">
                      <div className="relative size-9 shrink-0 bg-onyx"><Image src={p.image} alt="" fill sizes="36px" className="object-cover" /></div>
                      <span className="min-w-0 flex-1 truncate">{p.nameAr}</span>
                      <span className={`flex items-center gap-1 text-xs font-semibold ${p.stock === 0 ? "text-sale" : "text-brass-deep"}`}>
                        <AlertTriangle className="size-3.5" />{p.stock === 0 ? "نفذ" : `${p.stock} باقي`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="p-5 text-sm text-smoke">كل المنتجات متوفرة.</p>}
          </Card>
          <Link href="/admin/messages" className="flex items-center gap-4 border border-line bg-onyx p-5 text-bone hover:bg-ink">
            <Mail className="size-6 text-brass" strokeWidth={1.4} />
            <span className="flex-1"><span className="block font-semibold">رسائل العملاء</span><span className="text-sm text-bone/60">{d.unread ? `${d.unread} رسالة جديدة مستنية رد` : "مفيش رسائل جديدة"}</span></span>
          </Link>
        </div>
      </div>
    </>
  );
}
