import { requireAdmin } from "@/lib/admin";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { PageTitle, Pager, Table, inputCls, td } from "@/components/admin/ui";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const metadata = { title: "المنتجات" };
const PER = 20;
const FILTERS = [{ k: "", label: "الكل" }, { k: "active", label: "ظاهر" }, { k: "hidden", label: "مخفي" }, { k: "low", label: "مخزون قليل" }, { k: "out", label: "نفذ" }];

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; f?: string; page?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.trim();
  const where: Prisma.ProductWhereInput = {
    ...(q ? { OR: [{ nameAr: { contains: q } }, { nameEn: { contains: q } }, { slug: { contains: q.toLowerCase() } }, { brand: { name: { contains: q } } }] } : {}),
    ...(sp.cat ? { category: { slug: sp.cat } } : {}),
    ...(sp.f === "active" ? { active: true } : sp.f === "hidden" ? { active: false } : sp.f === "low" ? { stock: { gt: 0, lte: 3 } } : sp.f === "out" ? { stock: 0 } : {}),
  };
  const [rows, total, cats] = await Promise.all([
    db.product.findMany({ where, include: { category: true, brand: true }, orderBy: [{ active: "desc" }, { createdAt: "desc" }], skip: (page - 1) * PER, take: PER }),
    db.product.count({ where }),
    db.category.findMany({ orderBy: { sort: "asc" } }),
  ]);
  const qs = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ q: sp.q, cat: sp.cat, f: sp.f, ...o })) if (v) p.set(k, String(v));
    return `/admin/products${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageTitle title="المنتجات" sub={`${total} منتج`} actions={<Link href="/admin/products/new" className="btn-dark !py-2.5 !text-sm"><Plus className="size-4" />منتج جديد</Link>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto">
          {FILTERS.map((x) => (
            <Link key={x.k} href={qs({ f: x.k, page: undefined })} className={`shrink-0 border px-3 py-1.5 text-sm ${(sp.f ?? "") === x.k ? "border-onyx bg-onyx text-bone" : "border-line bg-bone hover:border-smoke"}`}>{x.label}</Link>
          ))}
        </nav>
        <form className="ms-auto flex w-full gap-2 sm:w-auto">
          {sp.f && <input type="hidden" name="f" value={sp.f} />}
          <select name="cat" defaultValue={sp.cat ?? ""} className={`${inputCls} sm:w-40`} aria-label="القسم">
            <option value="">كل الأقسام</option>
            {cats.map((c) => <option key={c.id} value={c.slug}>{c.nameAr}</option>)}
          </select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-smoke" />
            <input name="q" defaultValue={sp.q} placeholder="اسم المنتج أو البراند…" className={`${inputCls} ps-9`} />
          </div>
          <button className="btn-dark !px-4 !py-2 !text-sm">بحث</button>
        </form>
      </div>

      <Table head={["المنتج", "القسم", "السعر", "المخزون", "المبيعات", "الحالة", ""]} empty={rows.length === 0}>
        {rows.map((p) => (
          <tr key={p.id} className={`hover:bg-stone/40 ${p.active ? "" : "opacity-55"}`}>
            <td className={td}>
              <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 bg-onyx"><Image src={p.image} alt="" fill sizes="44px" className="object-cover" /></div>
                <div className="min-w-0"><p className="truncate font-semibold hover:text-brass-deep">{p.nameAr}</p><p className="text-xs text-smoke" dir="ltr">{p.brand.name}</p></div>
              </Link>
            </td>
            <td className={td}>{p.category.nameAr}</td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{money(p.price, "ar")}{p.compareAt && <s className="block text-xs text-smoke">{money(p.compareAt, "ar")}</s>}</td>
            <td className={`${td} tabular-nums`}><span className={p.stock === 0 ? "font-semibold text-sale" : p.stock <= 3 ? "font-semibold text-brass-deep" : ""}>{p.stock}</span></td>
            <td className={`${td} tabular-nums`}>{p.sold}</td>
            <td className={td}>
              <span className="flex flex-wrap gap-1 text-[0.7rem]">
                <span className={`px-2 py-0.5 ${p.active ? "bg-[#dfe7dc] text-[#3c6b3f]" : "bg-line text-smoke"}`}>{p.active ? "ظاهر" : "مخفي"}</span>
                {p.featured && <span className="bg-brass-soft/40 px-2 py-0.5 text-brass-deep">مميز</span>}
                {p.isNew && <span className="bg-onyx px-2 py-0.5 text-bone">جديد</span>}
              </span>
            </td>
            <td className={td}><ProductRowActions id={p.id} slug={p.slug} active={p.active} name={p.nameAr} /></td>
          </tr>
        ))}
      </Table>
      <Pager page={page} pages={Math.ceil(total / PER)} href={(p) => qs({ page: p })} />
    </>
  );
}
