"use client";
import Link from "next/link";
import { useTransition } from "react";
import { ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, toggleProduct } from "@/actions/admin/products";

export function ProductRowActions({ id, slug, active, name }: { id: string; slug: string; active: boolean; name: string }) {
  const [pending, start] = useTransition();
  const b = "grid size-8 place-items-center text-smoke hover:text-ink disabled:opacity-40";
  return (
    <div className="flex items-center justify-end gap-1">
      <button disabled={pending} onClick={() => start(() => toggleProduct(id))} className={b} aria-label={active ? `إخفاء ${name}` : `إظهار ${name}`} title={active ? "إخفاء من المتجر" : "إظهار في المتجر"}>
        {active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
      <Link href={`/admin/products/${id}`} className={b} aria-label={`تعديل ${name}`} title="تعديل"><Pencil className="size-4" /></Link>
      <a href={`/ar/p/${slug}`} target="_blank" className={b} aria-label={`عرض ${name} في المتجر`} title="عرض في المتجر"><ExternalLink className="size-4" /></a>
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm(`حذف "${name}"؟`)) return;
          start(async () => { const r = await deleteProduct(id); if (!r.deleted) alert("المنتج عليه طلبات قديمة، فاتخفى من المتجر بدل ما يتمسح."); });
        }}
        className={`${b} hover:!text-sale`} aria-label={`حذف ${name}`} title="حذف"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
