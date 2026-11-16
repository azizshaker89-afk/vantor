"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ExternalLink, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { saveProduct, uploadProductImage, type ProductInput } from "@/actions/admin/products";
import { inputCls } from "./ui";

type Opt = { id: string; name: string };
type Spec = [string, string];
export type ProductFormValue = Omit<ProductInput, "compareAt"> & { compareAt: number | null };

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").slice(0, 80);

function Box({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-bone ${className}`}>
      <h2 className="border-b border-line px-5 py-3 text-[0.95rem] font-semibold">{title}</h2>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function L({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-semibold">{label}</span>
      {children}
      {error ? <span role="alert" className="mt-1 block text-xs text-sale">{error}</span> : hint && <span className="mt-1 block text-xs text-smoke">{hint}</span>}
    </label>
  );
}

function Specs({ value, onChange, dir }: { value: Spec[]; onChange: (v: Spec[]) => void; dir: "rtl" | "ltr" }) {
  return (
    <div className="space-y-2" dir={dir}>
      {value.map(([k, v], i) => (
        <div key={i} className="flex gap-2">
          <input value={k} onChange={(e) => onChange(value.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} placeholder={dir === "rtl" ? "الخاصية" : "Label"} className={`${inputCls} w-2/5`} />
          <input value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} placeholder={dir === "rtl" ? "القيمة" : "Value"} className={inputCls} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="px-2 text-smoke hover:text-sale" aria-label="حذف"><X className="size-4" /></button>
        </div>
      ))}
      {value.length < 12 && (
        <button type="button" onClick={() => onChange([...value, ["", ""]])} className="flex items-center gap-1 text-xs font-semibold text-brass-deep hover:text-ink">
          <Plus className="size-3.5" />{dir === "rtl" ? "إضافة خاصية" : "Add spec"}
        </button>
      )}
    </div>
  );
}

export function ProductForm({ id, initial, categories, brands }: { id: string | null; initial: ProductFormValue; categories: Opt[]; brands: Opt[] }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) => {
    setV((x) => ({ ...x, [k]: val }));
    setSaved(false);
    if (errors[k as string]) setErrors((e) => ({ ...e, [k]: "" }));
  };
  const num = (s: string) => (s === "" ? 0 : Math.floor(Number(s)));

  const upload = async (file: File) => {
    setUploading(true); setUploadErr("");
    const fd = new FormData(); fd.set("file", file);
    const r = await uploadProductImage(fd);
    setUploading(false);
    if (!r.ok) return setUploadErr(r.error);
    setV((x) => ({ ...x, image: r.paths[0], gallery: [...r.paths, ...(x.gallery ?? []).filter((g) => !r.paths.includes(g))].slice(0, 8) }));
    setErrors((e) => ({ ...e, image: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const clean = (s: Spec[]) => s.filter(([a, b]) => a.trim() && b.trim());
      const r = await saveProduct(id, { ...v, specsAr: clean(v.specsAr as Spec[]), specsEn: clean(v.specsEn as Spec[]) });
      if (!r.ok) {
        setErrors(r.errors);
        setTimeout(() => document.querySelector("[role=alert]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return;
      }
      setSaved(true);
      if (!id) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    });
  };

  const gallery = v.gallery ?? [];

  return (
    <form onSubmit={submit} noValidate className="pb-24">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Box title="البيانات الأساسية">
            <div className="grid gap-4 md:grid-cols-2">
              <L label="الاسم بالعربي" error={errors.nameAr}><input value={v.nameAr} onChange={(e) => set("nameAr", e.target.value)} className={inputCls} /></L>
              <L label="الاسم بالإنجليزي" error={errors.nameEn}>
                <input dir="ltr" value={v.nameEn} onChange={(e) => { set("nameEn", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} className={inputCls} />
              </L>
            </div>
            <L label="رابط المنتج" error={errors.slug} hint="بيتعمل لوحده من الاسم الإنجليزي">
              <div className="flex" dir="ltr">
                <span className="border border-e-0 border-line bg-stone px-3 py-2.5 text-sm text-smoke">/p/</span>
                <input value={v.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className={inputCls} />
              </div>
            </L>
            <L label="الوصف بالعربي" error={errors.descAr}><textarea rows={3} value={v.descAr} onChange={(e) => set("descAr", e.target.value)} className={inputCls} /></L>
            <L label="الوصف بالإنجليزي" error={errors.descEn}><textarea dir="ltr" rows={3} value={v.descEn} onChange={(e) => set("descEn", e.target.value)} className={inputCls} /></L>
          </Box>

          <Box title="الصور">
            {errors.image && <p role="alert" className="text-xs text-sale">{errors.image}</p>}
            <div className="flex flex-wrap gap-3">
              {gallery.map((g) => (
                <div key={g} className={`group relative size-24 overflow-hidden bg-onyx ${g === v.image ? "ring-2 ring-brass ring-offset-2 ring-offset-bone" : ""}`}>
                  <Image src={g} alt="" fill sizes="96px" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-onyx/70 p-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                    <button type="button" onClick={() => set("image", g)} className="p-1 text-bone hover:text-brass" aria-label="اجعلها الصورة الرئيسية" title="الصورة الرئيسية"><Star className="size-3.5" /></button>
                    <button type="button" onClick={() => { const rest = gallery.filter((x) => x !== g); set("gallery", rest); if (v.image === g) set("image", rest[0] ?? ""); }} className="p-1 text-bone hover:text-[#e8a191]" aria-label="حذف الصورة"><Trash2 className="size-3.5" /></button>
                  </div>
                  {g === v.image && <span className="absolute top-1 start-1 bg-brass px-1.5 text-[0.6rem] font-bold text-onyx">رئيسية</span>}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="grid size-24 place-items-center border border-dashed border-smoke text-xs text-smoke hover:border-brass hover:text-brass-deep">
                {uploading ? <Loader2 className="size-5 animate-spin" /> : <span className="flex flex-col items-center gap-1"><ImagePlus className="size-5" />رفع صورة</span>}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
            </div>
            <p className="text-xs text-smoke">كل صورة بتترفع بيتعمل منها 3 نسخ: مربعة، ومقربة، وكاملة. {uploadErr && <span className="text-sale">{uploadErr}</span>}</p>
          </Box>

          <Box title="المواصفات">
            <div className="grid gap-6 md:grid-cols-2">
              <div><p className="mb-2 text-xs font-semibold text-smoke">عربي</p><Specs dir="rtl" value={v.specsAr as Spec[]} onChange={(x) => set("specsAr", x)} /></div>
              <div><p className="mb-2 text-xs font-semibold text-smoke">English</p><Specs dir="ltr" value={v.specsEn as Spec[]} onChange={(x) => set("specsEn", x)} /></div>
            </div>
          </Box>
        </div>

        <div className="space-y-6">
          <Box title="السعر والمخزون">
            <L label="السعر (ج.م)" error={errors.price}><input type="number" min={1} inputMode="numeric" dir="ltr" value={v.price || ""} onChange={(e) => set("price", num(e.target.value))} className={inputCls} /></L>
            <L label="السعر قبل الخصم (اختياري)" error={errors.compareAt}>
              <input type="number" min={0} inputMode="numeric" dir="ltr" value={v.compareAt ?? ""} onChange={(e) => set("compareAt", e.target.value === "" ? null : num(e.target.value))} className={inputCls} />
            </L>
            {v.compareAt != null && v.compareAt > v.price && v.price > 0 && <p className="text-xs text-[#3c6b3f]">خصم {Math.round(((v.compareAt - v.price) / v.compareAt) * 100)}%</p>}
            <L label="المخزون" error={errors.stock}><input type="number" min={0} inputMode="numeric" dir="ltr" value={v.stock} onChange={(e) => set("stock", num(e.target.value))} className={inputCls} /></L>
          </Box>
          <Box title="التصنيف">
            <L label="القسم" error={errors.categoryId}>
              <select value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
                <option value="">اختار…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </L>
            <L label="البراند" error={errors.brandId}>
              <select value={v.brandId} onChange={(e) => set("brandId", e.target.value)} className={inputCls}>
                <option value="">اختار…</option>{brands.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </L>
            {([["active", "ظاهر في المتجر"], ["featured", "منتج مميز (في الرئيسية)"], ["isNew", "عليه علامة جديد"]] as const).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                {label}
                <input type="checkbox" role="switch" checked={!!v[k]} onChange={(e) => set(k, e.target.checked)} className="peer sr-only" />
                <span aria-hidden className="relative h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-brass peer-focus-visible:ring-2 peer-focus-visible:ring-brass/50 after:absolute after:top-0.5 after:start-0.5 after:size-5 after:rounded-full after:bg-bone after:shadow after:transition-transform peer-checked:after:-translate-x-5 ltr:peer-checked:after:translate-x-5" />
              </label>
            ))}
          </Box>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bone/95 backdrop-blur lg:start-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-8">
          {saved && <span className="text-sm text-[#3c6b3f]" role="status">اتحفظ ✓</span>}
          {Object.values(errors).some(Boolean) && <span className="text-sm text-sale">راجع الخانات المعلّمة</span>}
          {id && <a href={`/ar/p/${initial.slug}`} target="_blank" className="btn-line !py-2.5 !text-sm"><ExternalLink className="size-4" />عرض في المتجر</a>}
          <button disabled={pending || uploading} className="btn-dark !py-2.5 !text-sm">{pending && <Loader2 className="size-4 animate-spin" />}{id ? "حفظ التعديلات" : "إضافة المنتج"}</button>
        </div>
      </div>
    </form>
  );
}
