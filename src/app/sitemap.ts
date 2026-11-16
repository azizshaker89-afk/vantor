import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { abs } from "@/lib/seo";

export const revalidate = 3600;

/** Every public page in both languages, each entry cross-linked to its translation. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const entry = (path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap =>
    (["ar", "en"] as const).map((l) => ({
      url: abs(`/${l}${path}`),
      lastModified,
      priority,
      alternates: { languages: { ar: abs(`/ar${path}`), en: abs(`/en${path}`) } },
    }));
  return [
    ...entry("", 1),
    ...entry("/shop", 0.9),
    ...categories.flatMap((c) => entry(`/c/${c.slug}`, 0.8)),
    ...products.flatMap((p) => entry(`/p/${p.slug}`, 0.7, p.updatedAt)),
    ...["/about", "/contact", "/shipping", "/returns", "/privacy"].flatMap((p) => entry(p, 0.3)),
  ];
}
