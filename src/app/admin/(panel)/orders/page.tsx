import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getDict } from "@/i18n/dict";
import { money } from "@/lib/format";
import { GOVERNORATES } from "@/lib/egypt";
import { ORDER_STATUSES, orderWhere } from "@/lib/admin-orders";
import { PageTitle, Pager, Table, inputCls, td } from "@/components/admin/ui";
import { StatusBadge, fmtDate } from "@/components/order/OrderDetail";

export const metadata = { title: "الطلبات" };
const t = getDict("ar");
const PER = 20;

export default async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = orderWhere(sp);
  const [rows, total, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { _count: { select: { items: true } } } }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], where: orderWhere({ q: sp.q }), _count: true }),
  ]);
  const all = counts.reduce((a, c) => a + c._count, 0);
  const qs = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: sp.q, status: sp.status, ...o })) if (v) p.set(k, String(v));
    return `/admin/orders${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageTitle title="الطلبات" sub={`${total} طلب`} actions={
        <a href={`/admin/orders/export?${new URLSearchParams(Object.entries({ q: sp.q ?? "", status: sp.status ?? "" }))}`} className="btn-line !py-2 !text-sm"><Download className="size-4" />تصدير CSV</a>
      } />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto" aria-label="الحالة">
          {[{ k: "", label: "الكل", n: all }, ...ORDER_STATUSES.map((s) => ({ k: s, label: t.order.statuses[s], n: counts.find((c) => c.status === s)?._count ?? 0 }))].map((x) => (
            <Link key={x.k} href={qs({ status: x.k, page: undefined })} aria-current={(sp.status ?? "") === x.k ? "true" : undefined}
              className={`shrink-0 border px-3 py-1.5 text-sm ${(sp.status ?? "") === x.k ? "border-onyx bg-onyx text-bone" : "border-line bg-bone hover:border-smoke"}`}>
              {x.label} <span className="text-xs opacity-60 tabular-nums">{x.n}</span>
            </Link>
          ))}
        </nav>
        <form className="relative ms-auto w-full sm:w-72">
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          <input name="q" defaultValue={sp.q} placeholder="رقم الطلب، الاسم، الموبايل…" className={`${inputCls} ps-9`} />
        </form>
      </div>

      <Table head={["رقم الطلب", "العميل", "المحافظة", "التاريخ", "القطع", "الإجمالي", "الحالة"]} empty={rows.length === 0}>
        {rows.map((o) => (
          <tr key={o.id} className="hover:bg-stone/40">
            <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-semibold hover:text-brass-deep" dir="ltr">{o.number}</Link></td>
            <td className={td}><p>{o.name}</p><p className="text-xs text-smoke" dir="ltr">{o.phone}</p></td>
            <td className={td}>{GOVERNORATES.find((g) => g.id === o.governorate)?.ar}</td>
            <td className={`${td} whitespace-nowrap text-smoke`}>{fmtDate(o.createdAt, "ar")}</td>
            <td className={`${td} tabular-nums`}>{o._count.items}</td>
            <td className={`${td} tabular-nums whitespace-nowrap`}>{money(o.total, "ar")}</td>
            <td className={td}><StatusBadge status={o.status} t={t} /></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER)} href={(p) => qs({ page: p })} />
    </>
  );
}
