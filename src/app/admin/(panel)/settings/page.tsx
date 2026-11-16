import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { FREE_SHIPPING_OVER, ZONES } from "@/lib/egypt";
import { money } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/Editors";

export const metadata = { title: "الإعدادات" };
const ZONE_AR: Record<string, string> = { metro: "القاهرة الكبرى", north: "الإسكندرية والدلتا والقناة", south: "الصعيد", remote: "المحافظات الحدودية" };

export default async function Settings() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <PageTitle title="الإعدادات" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="بيانات التواصل في المتجر"><p className="mb-4 text-sm text-smoke">بتظهر في الفوتر، وصفحة تواصل معنا، وزرار واتساب.</p><SettingsForm init={s} /></Card>
        <Card title="مناطق الشحن" pad={false}>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {Object.entries(ZONES).map(([k, z]) => (
                <tr key={k}><td className="px-5 py-3">{ZONE_AR[k]}</td><td className="px-5 py-3 text-smoke">{z.daysAr}</td><td className="px-5 py-3 text-end tabular-nums">{money(z.fee, "ar")}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line px-5 py-3 text-sm text-smoke">توصيل مجاني فوق {money(FREE_SHIPPING_OVER, "ar")}. الأسعار دي متعرّفة في الكود (src/lib/egypt.ts) عشان المتصفح والسيرفر يحسبوا نفس الرقم.</p>
        </Card>
      </div>
    </>
  );
}
