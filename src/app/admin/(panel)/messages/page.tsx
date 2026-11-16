import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { Phone } from "lucide-react";
import { db } from "@/lib/db";
import { PageTitle } from "@/components/admin/ui";
import { MessageActions } from "@/components/admin/MessageActions";

export const metadata = { title: "الرسائل" };

const ago = (d: Date) => {
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 60) return `من ${Math.max(1, m)} دقيقة`;
  if (m < 1440) return `من ${Math.round(m / 60)} ساعة`;
  return `من ${Math.round(m / 1440)} يوم`;
};

export default async function Messages({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin();
  const f = (await searchParams).f;
  const rows = await db.message.findMany({ where: f === "unread" ? { read: false } : {}, orderBy: [{ read: "asc" }, { createdAt: "desc" }] });
  const unread = await db.message.count({ where: { read: false } });
  return (
    <>
      <PageTitle title="الرسائل" sub={`${unread} رسالة جديدة`} actions={
        <div className="flex border border-line bg-bone p-0.5 text-sm">
          <Link href="/admin/messages" className={`px-3.5 py-1.5 ${f !== "unread" ? "bg-onyx text-bone" : "text-smoke"}`}>الكل</Link>
          <Link href="/admin/messages?f=unread" className={`px-3.5 py-1.5 ${f === "unread" ? "bg-onyx text-bone" : "text-smoke"}`}>الجديدة</Link>
        </div>
      } />
      {rows.length === 0 ? <p className="border border-dashed border-line p-12 text-center text-smoke">مفيش رسائل.</p> : (
        <ul className="space-y-3">
          {rows.map((m) => (
            <li key={m.id} className={`border bg-bone p-5 ${m.read ? "border-line" : "border-brass border-s-4"}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-semibold">{m.name}</p>
                {!m.read && <span className="bg-brass px-1.5 text-[0.65rem] font-bold text-onyx">جديدة</span>}
                <a href={`mailto:${m.email}`} className="text-sm text-smoke hover:text-brass-deep" dir="ltr">{m.email}</a>
                {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 text-sm text-smoke hover:text-brass-deep" dir="ltr"><Phone className="size-3" />{m.phone}</a>}
                <span className="ms-auto text-xs text-smoke">{ago(m.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line leading-7">{m.body}</p>
              <div className="mt-3 border-t border-line pt-2"><MessageActions id={m.id} read={m.read} email={m.email} name={m.name} /></div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
