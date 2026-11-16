import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productOptions } from "@/lib/admin-products";
import { PageTitle } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "منتج جديد" };

export default async function NewProduct() {
  await requireAdmin();
  const o = await productOptions();
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-smoke hover:text-ink"><ArrowRight className="size-4" />المنتجات</Link>
      <PageTitle title="منتج جديد" />
      <ProductForm id={null} {...o} initial={{
        nameAr: "", nameEn: "", slug: "", descAr: "", descEn: "", price: 0, compareAt: null, stock: 10, categoryId: "", brandId: "",
        featured: false, isNew: true, active: true, image: "", gallery: [], specsAr: [["الخامة", ""]], specsEn: [["Material", ""]],
      }} />
    </>
  );
}
