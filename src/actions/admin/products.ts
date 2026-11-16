"use server";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

const spec = z.tuple([z.string().trim().min(1).max(40), z.string().trim().min(1).max(80)]);
const schema = z.object({
  nameAr: z.string().trim().min(2, "الاسم بالعربي مطلوب").max(80),
  nameEn: z.string().trim().min(2, "الاسم بالإنجليزي مطلوب").max(80),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "الرابط حروف إنجليزي صغيرة وأرقام وشرطة بس").max(80),
  descAr: z.string().trim().min(10, "الوصف بالعربي قصير").max(1000),
  descEn: z.string().trim().min(10, "الوصف بالإنجليزي قصير").max(1000),
  price: z.number().int().min(1, "السعر لازم يكون أكبر من صفر").max(1_000_000),
  compareAt: z.number().int().max(1_000_000).nullable(),
  stock: z.number().int().min(0, "المخزون مينفعش يبقى سالب").max(100_000),
  categoryId: z.string().min(1, "اختار القسم"),
  brandId: z.string().min(1, "اختار البراند"),
  featured: z.boolean(), isNew: z.boolean(), active: z.boolean(),
  image: z.string().min(1, "ارفع صورة للمنتج"),
  gallery: z.array(z.string()).max(8),
  specsAr: z.array(spec).max(12),
  specsEn: z.array(spec).max(12),
}).refine((d) => d.compareAt == null || d.compareAt > d.price, { path: ["compareAt"], message: "السعر قبل الخصم لازم يكون أكبر من السعر" });

export type ProductInput = z.input<typeof schema>;
export type SaveResult = { ok: true; id: string } | { ok: false; errors: Record<string, string> };

const refresh = () => { revalidatePath("/admin", "layout"); revalidatePath("/[locale]", "layout"); };

export async function saveProduct(id: string | null, input: ProductInput): Promise<SaveResult> {
  await assertAdmin();
  const p = schema.safeParse(input);
  if (!p.success) return { ok: false, errors: Object.fromEntries(p.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const { specsAr, specsEn, gallery, ...d } = p.data;
  const clash = await db.product.findFirst({ where: { slug: d.slug, NOT: id ? { id } : undefined }, select: { id: true } });
  if (clash) return { ok: false, errors: { slug: "الرابط ده مستخدم لمنتج تاني" } };
  const data = { ...d, specsAr: JSON.stringify(specsAr), specsEn: JSON.stringify(specsEn), gallery: JSON.stringify(gallery.length ? gallery : [d.image]) };
  const row = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data });
  refresh();
  return { ok: true, id: row.id };
}

export async function toggleProduct(id: string) {
  await assertAdmin();
  const p = await db.product.findUniqueOrThrow({ where: { id }, select: { active: true } });
  await db.product.update({ where: { id }, data: { active: !p.active } });
  refresh();
}

/** Products with order history are hidden, not deleted, so old orders keep their references. */
export async function deleteProduct(id: string): Promise<{ deleted: boolean }> {
  await assertAdmin();
  const used = await db.orderItem.count({ where: { productId: id } });
  if (used) await db.product.update({ where: { id }, data: { active: false } });
  else await db.product.delete({ where: { id } });
  refresh();
  return { deleted: !used };
}

/** Accepts one image, stores a square main, a close-up and an uncropped variant (same as the catalogue pipeline). */
export async function uploadProductImage(form: FormData): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  await assertAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "اختار صورة" };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "أقصى حجم 8 ميجا" };
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return { ok: false, error: "الصيغ المسموحة: JPG, PNG, WEBP" };
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const meta = await sharp(buf).metadata();
    if (!meta.width || !meta.height) throw new Error();
  } catch {
    return { ok: false, error: "الملف ده مش صورة صالحة" };
  }
  const dir = path.join(process.cwd(), "uploads", "products");
  await fs.mkdir(dir, { recursive: true });
  const base = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const img = sharp(buf).rotate();
  await img.clone().resize(900, 900, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toFile(path.join(dir, `${base}.webp`));
  const big = await img.clone().resize(1530, 1530, { fit: "cover", position: "attention" }).toBuffer();
  await sharp(big).extract({ left: 315, top: 315, width: 900, height: 900 }).webp({ quality: 80 }).toFile(path.join(dir, `${base}-detail.webp`));
  await img.clone().resize(900, 900, { fit: "contain", background: "#000" }).webp({ quality: 80 }).toFile(path.join(dir, `${base}-full.webp`));
  return { ok: true, paths: ["", "-detail", "-full"].map((s) => `/uploads/products/${base}${s}.webp`) };
}
