import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { PageTitle, Pager, Table, inputCls, td } from "@/components/admin/ui";
import { fmtDate } from "@/components/order/OrderDetail";

export const metadata = { title: "العملاء" };
const PER = 20;

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const where: Prisma.UserWhereInput = { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q.toLowerCase() } }, { phone: { contains: q } }] } : {}) };
  const [rows, total] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER, take: PER, include: { orders: { select: { total: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } } }),
    db.user.count({ where }),
  ]);
  return (
    <>
      <PageTitle title="العملاء" sub={`${total} عميل مسجل`} />
      <form className="relative mb-4 sm:w-80">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-smoke" />
        <input name="q" defaultValue={sp.q} placeholder="الاسم، البريد، الموبايل…" className={`${inputCls} ps-9`} />
      </form>
      <Table head={["العميل", "الموبايل", "الطلبات", "إجمالي المشتريات", "آخر طلب", "انضم"]} empty={!rows.length}>
        {rows.map((u) => {
          const live = u.orders.filter((o) => o.status !== "CANCELLED");
          return (
            <tr key={u.id} className="hover:bg-stone/40">
              <td className={td}>
                <Link href={`/admin/customers/${u.id}`} className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-onyx text-sm text-brass-soft">{u.name.trim()[0]}</span>
                  <span><span className="block font-semibold hover:text-brass-deep">{u.name}</span><span className="text-xs text-smoke" dir="ltr">{u.email}</span></span>
                </Link>
              </td>
              <td className={td} dir="ltr">{u.phone}</td>
              <td className={`${td} tabular-nums`}>{u.orders.length}</td>
              <td className={`${td} tabular-nums`}>{money(live.reduce((a, o) => a + o.total, 0), "ar")}</td>
              <td className={`${td} text-smoke`}>{u.orders[0] ? fmtDate(u.orders[0].createdAt, "ar") : "—"}</td>
              <td className={`${td} text-smoke`}>{fmtDate(u.createdAt, "ar")}</td>
            </tr>
          );
        })}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER)} href={(p) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`} />
    </>
  );
}
