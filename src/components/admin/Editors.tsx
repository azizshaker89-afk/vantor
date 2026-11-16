"use client";
import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteBrand, deleteCoupon, saveBrand, saveCategory, saveCoupon, saveSettings, toggleCoupon, type Res } from "@/actions/admin/misc";
import { inputCls } from "./ui";

/** Shared state for small inline forms. */
function useEdit<T extends Record<string, unknown>>(init: T, save: (v: T) => Promise<Res>, onOk?: () => void) {
  const [v, setV] = useState(init);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const field = (k: keyof T & string) => ({
    value: (v[k] ?? "") as string | number,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const raw = e.target.value;
      setV((x) => ({ ...x, [k]: typeof init[k] === "number" ? (raw === "" ? 0 : Math.floor(Number(raw))) : raw }));
      setErrors((x) => ({ ...x, [k]: "" })); setDone(false);
    },
    "aria-invalid": !!errors[k],
  });
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    start(async () => {
      const r = await save(v);
      if (r.ok) { setDone(true); setErrors({}); onOk?.(); } else setErrors(r.errors);
    });
  };
  return { v, setV, field, errors, done, pending, submit };
}

const Err = ({ m }: { m?: string }) => (m ? <span role="alert" className="mt-1 block text-xs text-sale">{m}</span> : null);
const F = ({ label, children, error, className = "" }: { label: string; children: React.ReactNode; error?: string; className?: string }) => (
  <label className={`block text-sm ${className}`}><span className="mb-1 block text-xs font-semibold text-smoke">{label}</span>{children}<Err m={error} /></label>
);
const SaveBtn = ({ pending, done, label = "حفظ" }: { pending: boolean; done: boolean; label?: string }) => (
  <div className="flex items-center gap-3">
    <button disabled={pending} className="btn-dark !px-4 !py-2 !text-sm">{pending && <Loader2 className="size-4 animate-spin" />}{label}</button>
    {done && <span className="text-sm text-[#3c6b3f]" role="status">اتحفظ ✓</span>}
  </div>
);

export function CategoryEditor({ id, init }: { id: string; init: { nameAr: string; nameEn: string; descAr: string; descEn: string } }) {
  const f = useEdit(init, (v) => saveCategory(id, v));
  return (
    <form onSubmit={f.submit} className="grid gap-3 sm:grid-cols-2">
      <F label="الاسم بالعربي" error={f.errors.nameAr}><input className={inputCls} {...f.field("nameAr")} /></F>
      <F label="Name (EN)" error={f.errors.nameEn}><input dir="ltr" className={inputCls} {...f.field("nameEn")} /></F>
      <F label="الوصف بالعربي" error={f.errors.descAr}><textarea rows={2} className={inputCls} {...f.field("descAr")} /></F>
      <F label="Description (EN)" error={f.errors.descEn}><textarea dir="ltr" rows={2} className={inputCls} {...f.field("descEn")} /></F>
      <div className="sm:col-span-2"><SaveBtn pending={f.pending} done={f.done} /></div>
    </form>
  );
}

type BrandV = { name: string; slug: string; taglineAr: string; taglineEn: string };
export function BrandRow({ id, init, count }: { id: string | null; init: BrandV; count: number }) {
  const [edit, setEdit] = useState(!id);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const f = useEdit(init, (v) => saveBrand(id, v), () => { if (id) setEdit(false); else f.setV(init); });
  if (!edit)
    return (
      <li className="flex items-center gap-4 px-5 py-3 text-sm">
        <div className="min-w-0 flex-1"><p className="font-semibold" dir="ltr">{init.name}</p><p className="truncate text-xs text-smoke">{init.taglineAr}</p></div>
        <span className="text-xs text-smoke tabular-nums">{count} منتج</span>
        {msg && <span className="text-xs text-sale">{msg}</span>}
        <button onClick={() => setEdit(true)} className="p-1.5 text-smoke hover:text-ink" aria-label={`تعديل ${init.name}`}><Pencil className="size-4" /></button>
        <button disabled={pending} onClick={() => confirm(`حذف ${init.name}؟`) && start(async () => { const r = await deleteBrand(id!); if (!r.ok) setMsg(r.errors.form); })}
          className="p-1.5 text-smoke hover:text-sale" aria-label={`حذف ${init.name}`}><Trash2 className="size-4" /></button>
      </li>
    );
  return (
    <li className="px-5 py-4">
      <form onSubmit={f.submit} className="grid gap-3 sm:grid-cols-2">
        <F label="اسم البراند" error={f.errors.name}><input dir="ltr" className={inputCls} {...f.field("name")} /></F>
        <F label="Slug" error={f.errors.slug}><input dir="ltr" className={inputCls} {...f.field("slug")} /></F>
        <F label="الشعار بالعربي" error={f.errors.taglineAr}><input className={inputCls} {...f.field("taglineAr")} /></F>
        <F label="Tagline (EN)" error={f.errors.taglineEn}><input dir="ltr" className={inputCls} {...f.field("taglineEn")} /></F>
        <div className="flex items-center gap-3 sm:col-span-2">
          <SaveBtn pending={f.pending} done={f.done && !id} label={id ? "حفظ" : "إضافة البراند"} />
          {id && <button type="button" onClick={() => setEdit(false)} className="text-sm text-smoke hover:text-ink">إلغاء</button>}
        </div>
      </form>
    </li>
  );
}

type CouponV = { code: string; type: "PERCENT" | "FIXED"; value: number; minTotal: number; active: boolean; expiresAt: string | null };
export function CouponForm({ id, init, onDone }: { id: string | null; init: CouponV; onDone?: () => void }) {
  const f = useEdit(init, (v) => saveCoupon(id, { ...v, expiresAt: v.expiresAt || null }), () => { if (!id) f.setV(init); onDone?.(); });
  return (
    <form onSubmit={f.submit} className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_130px_110px_130px_150px_auto]">
      <F label="الكود" error={f.errors.code}><input dir="ltr" className={`${inputCls} uppercase`} {...f.field("code")} /></F>
      <F label="النوع"><select className={inputCls} {...f.field("type")}><option value="PERCENT">نسبة %</option><option value="FIXED">مبلغ ثابت</option></select></F>
      <F label={f.v.type === "PERCENT" ? "النسبة" : "المبلغ"} error={f.errors.value}><input type="number" dir="ltr" className={inputCls} {...f.field("value")} /></F>
      <F label="حد أدنى للطلب" error={f.errors.minTotal}><input type="number" dir="ltr" className={inputCls} {...f.field("minTotal")} /></F>
      <F label="ينتهي في (اختياري)"><input type="date" dir="ltr" className={inputCls} {...f.field("expiresAt")} /></F>
      <div className="flex items-center gap-2 pt-5">
        <button disabled={f.pending} className="btn-dark !px-4 !py-2.5 !text-sm">{f.pending ? <Loader2 className="size-4 animate-spin" /> : id ? <Check className="size-4" /> : <Plus className="size-4" />}{id ? "حفظ" : "إضافة"}</button>
        {id && <button type="button" onClick={onDone} className="p-2 text-smoke hover:text-ink" aria-label="إلغاء"><X className="size-4" /></button>}
      </div>
    </form>
  );
}

export function CouponActions({ id, active, init }: { id: string; active: boolean; init: CouponV }) {
  const [edit, setEdit] = useState(false);
  const [pending, start] = useTransition();
  if (edit) return <div className="fixed inset-0 z-50 grid place-items-center bg-onyx/50 p-4" onClick={() => setEdit(false)}><div className="w-full max-w-4xl bg-bone p-6" onClick={(e) => e.stopPropagation()}><h2 className="mb-4 font-semibold">تعديل {init.code}</h2><CouponForm id={id} init={init} onDone={() => setEdit(false)} /></div></div>;
  return (
    <div className="flex items-center justify-end gap-1">
      <button disabled={pending} onClick={() => start(() => toggleCoupon(id))} role="switch" aria-checked={active} aria-label={`تفعيل ${init.code}`}
        className={`relative h-6 w-11 rounded-full transition-colors ${active ? "bg-brass" : "bg-line"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-bone shadow transition-all ${active ? "start-[1.375rem]" : "start-0.5"}`} />
      </button>
      <button onClick={() => setEdit(true)} className="p-2 text-smoke hover:text-ink" aria-label={`تعديل ${init.code}`}><Pencil className="size-4" /></button>
      <button disabled={pending} onClick={() => confirm(`حذف الكود ${init.code}؟`) && start(() => deleteCoupon(id))} className="p-2 text-smoke hover:text-sale" aria-label={`حذف ${init.code}`}><Trash2 className="size-4" /></button>
    </div>
  );
}

export function SettingsForm({ init }: { init: { whatsapp: string; phone: string; email: string } }) {
  const f = useEdit(init, saveSettings);
  return (
    <form onSubmit={f.submit} className="max-w-xl space-y-4">
      <F label="رقم واتساب (دولي)" error={f.errors.whatsapp}><input dir="ltr" className={inputCls} placeholder="201000000000" {...f.field("whatsapp")} /></F>
      <F label="رقم التليفون" error={f.errors.phone}><input dir="ltr" className={inputCls} {...f.field("phone")} /></F>
      <F label="البريد الإلكتروني" error={f.errors.email}><input dir="ltr" className={inputCls} {...f.field("email")} /></F>
      <SaveBtn pending={f.pending} done={f.done} />
    </form>
  );
}
