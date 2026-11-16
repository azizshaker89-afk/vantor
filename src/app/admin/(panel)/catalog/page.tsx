import { requireAdmin } from "@/lib/admin";
import Image from "next/image";
import { db } from "@/lib/db";
import { Card, PageTitle } from "@/components/admin/ui";
import { BrandRow, CategoryEditor } from "@/components/admin/Editors";

export const metadata = { title: "الأقسام والبراندات" };

export default async function Catalog() {
  await requireAdmin();
  const [cats, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { products: true } } } }),
    db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  return (
    <>
      <PageTitle title="الأقسام والبراندات" sub="الأقسام ثابتة في تصميم المتجر، تقدر تعدّل أسماءها ووصفها. البراندات تقدر تضيف وتعدل وتمسح." />
      <div className="grid gap-6 2xl:grid-cols-2">
        <div className="space-y-4">
          {cats.map((c) => (
            <Card key={c.id} title={`${c.nameAr} · ${c._count.products} منتج`}>
              <div className="flex gap-5">
                <div className="relative hidden h-28 w-20 shrink-0 bg-onyx sm:block"><Image src={c.image} alt="" fill sizes="80px" className="object-cover" /></div>
                <div className="flex-1"><CategoryEditor id={c.id} init={{ nameAr: c.nameAr, nameEn: c.nameEn, descAr: c.descAr, descEn: c.descEn }} /></div>
              </div>
            </Card>
          ))}
        </div>
        <Card title={`البراندات (${brands.length})`} pad={false} className="h-fit">
          <ul className="divide-y divide-line">
            {brands.map((b) => <BrandRow key={b.id} id={b.id} count={b._count.products} init={{ name: b.name, slug: b.slug, taglineAr: b.taglineAr, taglineEn: b.taglineEn }} />)}
          </ul>
          <div className="border-t-2 border-dashed border-line">
            <p className="px-5 pt-4 text-sm font-semibold">براند جديد</p>
            <ul><BrandRow id={null} count={0} init={{ name: "", slug: "", taglineAr: "", taglineEn: "" }} /></ul>
          </div>
        </Card>
      </div>
    </>
  );
}
