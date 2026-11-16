"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/admin";

export type Res = { ok: true } | { ok: false; errors: Record<string, string> };
const errs = (e: z.ZodError) => ({ ok: false as const, errors: Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message])) });
const refresh = () => { revalidatePath("/admin", "layout"); revalidatePath("/[locale]", "layout"); };

/* Categories (fixed set; names and copy editable) */
const category = z.object({
  nameAr: z.string().trim().min(2, "مطلوب").max(40), nameEn: z.string().trim().min(2, "مطلوب").max(40),
  descAr: z.string().trim().min(5, "قصير").max(300), descEn: z.string().trim().min(5, "قصير").max(300),
});
export async function saveCategory(id: string, input: unknown): Promise<Res> {
  await assertAdmin();
  const p = category.safeParse(input);
  if (!p.success) return errs(p.error);
  await db.category.update({ where: { id }, data: p.data });
  refresh();
  return { ok: true };
}

/* Brands */
const brand = z.object({
  name: z.string().trim().min(2, "مطلوب").max(40),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "حروف إنجليزي صغيرة وشرطة"),
  taglineAr: z.string().trim().min(3, "مطلوب").max(120), taglineEn: z.string().trim().min(3, "مطلوب").max(120),
});
export async function saveBrand(id: string | null, input: unknown): Promise<Res> {
  await assertAdmin();
  const p = brand.safeParse(input);
  if (!p.success) return errs(p.error);
  const clash = await db.brand.findFirst({ where: { slug: p.data.slug, NOT: id ? { id } : undefined } });
  if (clash) return { ok: false, errors: { slug: "مستخدم قبل كده" } };
  if (id) await db.brand.update({ where: { id }, data: p.data }); else await db.brand.create({ data: p.data });
  refresh();
  return { ok: true };
}
export async function deleteBrand(id: string): Promise<Res> {
  await assertAdmin();
  if (await db.product.count({ where: { brandId: id } })) return { ok: false, errors: { form: "البراند ده عليه منتجات، انقلها لبراند تاني الأول" } };
  await db.brand.delete({ where: { id } });
  refresh();
  return { ok: true };
}

/* Coupons */
const coupon = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, "من 3 لـ 20 حرف إنجليزي أو رقم"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1, "أكبر من صفر"),
  minTotal: z.number().int().min(0),
  active: z.boolean(),
  expiresAt: z.string().nullable(),
}).refine((c) => c.type !== "PERCENT" || c.value <= 90, { path: ["value"], message: "النسبة أقصاها 90%" });
export async function saveCoupon(id: string | null, input: unknown): Promise<Res> {
  await assertAdmin();
  const p = coupon.safeParse(input);
  if (!p.success) return errs(p.error);
  const clash = await db.coupon.findFirst({ where: { code: p.data.code, NOT: id ? { id } : undefined } });
  if (clash) return { ok: false, errors: { code: "الكود ده موجود" } };
  const data = { ...p.data, expiresAt: p.data.expiresAt ? new Date(`${p.data.expiresAt}T23:59:59`) : null };
  if (id) await db.coupon.update({ where: { id }, data }); else await db.coupon.create({ data });
  revalidatePath("/admin/coupons");
  return { ok: true };
}
export async function toggleCoupon(id: string) {
  await assertAdmin();
  const c = await db.coupon.findUniqueOrThrow({ where: { id } });
  await db.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/coupons");
}
export async function deleteCoupon(id: string) {
  await assertAdmin();
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
}

/* Messages */
export async function setMessageRead(id: string, read: boolean) {
  await assertAdmin();
  await db.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
}
export async function deleteMessage(id: string) {
  await assertAdmin();
  await db.message.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

/* Settings (contact details shown on the storefront) */
const settings = z.object({
  whatsapp: z.string().trim().regex(/^20\d{10}$/, "بالصيغة الدولية: 20 ثم الرقم من غير الصفر"),
  phone: z.string().trim().regex(/^0\d{9,10}$/, "رقم مصري صحيح"),
  email: z.string().trim().email("بريد غير صحيح"),
});
export async function saveSettings(input: unknown): Promise<Res> {
  await assertAdmin();
  const p = settings.safeParse(input);
  if (!p.success) return errs(p.error);
  await db.$transaction(Object.entries(p.data).map(([key, value]) => db.setting.upsert({ where: { key }, create: { key, value }, update: { value } })));
  refresh();
  return { ok: true };
}
