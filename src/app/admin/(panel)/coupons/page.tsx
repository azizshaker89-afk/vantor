import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { Card, PageTitle, Table, td } from "@/components/admin/ui";
import { CouponActions, CouponForm } from "@/components/admin/Editors";

export const metadata = { title: "الكوبونات" };

export default async function Coupons() {
  await requireAdmin();
  const [rows, usage] = await Promise.all([
    db.coupon.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] }),
    db.order.groupBy({ by: ["couponCode"], where: { couponCode: { not: null }, status: { not: "CANCELLED" } }, _sum: { discount: true } }),
  ]);
  const now = new Date();
  return (
    <>
      <PageTitle title="الكوبونات" sub="أكواد الخصم اللي العملاء بيكتبوها في السلة" />
      <Card title="كوبون جديد" className="mb-6">
        <CouponForm id={null} init={{ code: "", type: "PERCENT", value: 10, minTotal: 0, active: true, expiresAt: null }} />
      </Card>
      <Table head={["الكود", "الخصم", "حد أدنى", "الاستخدام", "إجمالي الخصومات", "الصلاحية", ""]} empty={!rows.length}>
        {rows.map((c) => {
          const expired = c.expiresAt && c.expiresAt < now;
          return (
            <tr key={c.id} className={c.active && !expired ? "" : "opacity-60"}>
              <td className={td}><span className="border border-dashed border-brass px-2 py-1 font-mono text-xs font-bold tracking-wider" dir="ltr">{c.code}</span></td>
              <td className={`${td} tabular-nums`}>{c.type === "PERCENT" ? `${c.value}%` : money(c.value, "ar")}</td>
              <td className={`${td} tabular-nums`}>{c.minTotal ? money(c.minTotal, "ar") : "—"}</td>
              <td className={`${td} tabular-nums`}>{c.uses} مرة</td>
              <td className={`${td} tabular-nums`}>{money(usage.find((u) => u.couponCode === c.code)?._sum.discount ?? 0, "ar")}</td>
              <td className={`${td} text-xs`}>{expired ? <span className="text-sale">منتهي</span> : c.expiresAt ? `لحد ${c.expiresAt.toLocaleDateString("ar-EG-u-nu-latn")}` : "مفتوح"}</td>
              <td className={td}>
                <CouponActions id={c.id} active={c.active} init={{ code: c.code, type: c.type as "PERCENT" | "FIXED", value: c.value, minTotal: c.minTotal, active: c.active, expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null }} />
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
