"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Printer } from "lucide-react";
import { setOrderStatus } from "@/actions/admin/orders";
import { useI18n } from "../I18nProvider";

const ORDER = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function StatusControl({ id, status }: { id: string; status: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [v, setV] = useState(status);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const save = () => {
    if (v === "CANCELLED" && !confirm("إلغاء الطلب هيرجّع القطع للمخزون. متأكد؟")) return;
    start(async () => {
      const r = await setOrderStatus(id, v);
      setMsg(r.ok ? "اتحفظ ✓" : r.error ?? "حصلت مشكلة");
      if (r.ok) router.refresh(); else setV(status);
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <label className="sr-only" htmlFor="st">الحالة</label>
      <select id="st" value={v} onChange={(e) => { setV(e.target.value); setMsg(""); }} className="border border-line bg-bone px-3 py-2 text-sm outline-none focus:border-brass">
        {ORDER.map((s) => <option key={s} value={s}>{t.order.statuses[s]}</option>)}
      </select>
      <button onClick={save} disabled={pending || v === status} className="btn-dark !px-4 !py-2 !text-sm">{pending && <Loader2 className="size-4 animate-spin" />}تحديث الحالة</button>
      <button onClick={() => window.print()} className="btn-line !px-4 !py-2 !text-sm"><Printer className="size-4" />طباعة فاتورة</button>
      {msg && <span className="text-sm text-smoke" role="status">{msg}</span>}
    </div>
  );
}
