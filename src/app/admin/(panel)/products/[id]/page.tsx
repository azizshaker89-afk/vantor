import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { productOptions } from "@/lib/admin-products";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id: (await params).id }, select: { nameAr: true } });
  return { title: p?.nameAr ?? "منتج" };
}

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [p, o] = await Promise.all([db.product.findUnique({ where: { id } }), productOptions()]);
  if (!p) notFound();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-ink"><ArrowRight className="size-4" />المنتجات</Link>
      <PageTitle title={p.nameAr} sub={`اتباع منه ${p.sold} قطعة · آخر تعديل ${p.updatedAt.toLocaleDateString("ar-EG-u-nu-latn")}`} />
      <ProductForm id={id} {...o} initial={{
        nameAr: p.nameAr, nameEn: p.nameEn, slug: p.slug, descAr: p.descAr, descEn: p.descEn, price: p.price, compareAt: p.compareAt, stock: p.stock,
        categoryId: p.categoryId, brandId: p.brandId, featured: p.featured, isNew: p.isNew, active: p.active, image: p.image, gallery: JSON.parse(p.gallery), specsAr: JSON.parse(p.specsAr), specsEn: JSON.parse(p.specsEn) }} />
    </>
  );
}
