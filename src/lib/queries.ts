import "server-only";
import { db } from "./db";
import type { Locale } from "@/i18n/dict";
import type { CardProduct } from "./types";
import type { Prisma } from "@prisma/client";

const include = { brand: true, category: true } as const;
type Row = Prisma.ProductGetPayload<{ include: typeof include }>;

export const toCard = (p: Row, l: Locale): CardProduct => ({
  id: p.id,
  slug: p.slug,
  name: l === "ar" ? p.nameAr : p.nameEn,
  desc: l === "ar" ? p.descAr : p.descEn,
  brand: p.brand.name,
  category: l === "ar" ? p.category.nameAr : p.category.nameEn,
  price: p.price,
  compareAt: p.compareAt,
  stock: p.stock,
  image: p.image,
  isNew: p.isNew,
});

export async function homeData(l: Locale) {
  const where = { active: true };
  const [categories, featured, fresh, best, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { products: { where } } } } }),
    db.product.findMany({ where: { ...where, featured: true }, include, orderBy: { sold: "desc" }, take: 8 }),
    db.product.findMany({ where: { ...where, isNew: true }, include, orderBy: { createdAt: "desc" }, take: 8 }),
    db.product.findMany({ where, include, orderBy: { sold: "desc" }, take: 8 }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  return {
    categories: categories.map((c) => ({
      slug: c.slug,
      name: l === "ar" ? c.nameAr : c.nameEn,
      desc: l === "ar" ? c.descAr : c.descEn,
      image: c.image,
      count: c._count.products,
    })),
    tabs: { featured: featured.map((p) => toCard(p, l)), new: fresh.map((p) => toCard(p, l)), best: best.map((p) => toCard(p, l)) },
    favourites: best.slice(0, 4).map((p) => toCard(p, l)),
    brands: brands.map((b) => ({ slug: b.slug, name: b.name, tagline: l === "ar" ? b.taglineAr : b.taglineEn })),
  };
}

export async function navCategories(l: Locale) {
  const rows = await db.category.findMany({ orderBy: { sort: "asc" } });
  return rows.map((c) => ({ slug: c.slug, name: l === "ar" ? c.nameAr : c.nameEn }));
}

export async function categoriesWithCounts(l: Locale) {
  const rows = await db.category.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { products: { where: { active: true } } } } } });
  return rows.map((c) => ({ slug: c.slug, name: l === "ar" ? c.nameAr : c.nameEn, image: c.image, count: c._count.products }));
}
