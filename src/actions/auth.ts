"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSession, destroySession, sessionUserId } from "@/lib/auth";
import { fieldErrors, loginSchema, passwordSchema, profileSchema, registerSchema, type FieldErrors } from "@/lib/validation";
import { isLocale } from "@/i18n/dict";

export type FormResult = { ok: true } | { ok: false; errors: FieldErrors };

// Only allow same-site relative redirects after login.
const safeNext = (next: string | undefined, l: string) =>
  next && /^\/(ar|en)\/[\w\-/?=&%.]*$/.test(next) && !next.startsWith("//") ? next : `/${isLocale(l) ? l : "ar"}/account`;

// Naive in-memory throttle (per process): 6 failed attempts per email per 10 minutes.
const fails = new Map<string, { n: number; until: number }>();

export async function register(input: unknown, l: string, next?: string): Promise<FormResult> {
  const p = registerSchema.safeParse(input);
  if (!p.success) return { ok: false, errors: fieldErrors(p.error) };
  const exists = await db.user.findUnique({ where: { email: p.data.email } });
  if (exists) return { ok: false, errors: { email: "taken" } };
  const user = await db.user.create({
    data: { name: p.data.name, email: p.data.email, phone: p.data.phone, passwordHash: await bcrypt.hash(p.data.password, 10) },
  });
  await createSession(user.id);
  redirect(safeNext(next, l));
}

export async function login(input: unknown, l: string, next?: string): Promise<FormResult> {
  const p = loginSchema.safeParse(input);
  if (!p.success) return { ok: false, errors: fieldErrors(p.error) };
  const f = fails.get(p.data.email);
  if (f && f.n >= 6 && f.until > Date.now()) return { ok: false, errors: { form: "throttled" } };
  const user = await db.user.findUnique({ where: { email: p.data.email } });
  const good = user && (await bcrypt.compare(p.data.password, user.passwordHash));
  if (!good) {
    const cur = f && f.until > Date.now() ? f : { n: 0, until: Date.now() + 10 * 60_000 };
    fails.set(p.data.email, { ...cur, n: cur.n + 1 });
    return { ok: false, errors: { form: "credentials" } };
  }
  fails.delete(p.data.email);
  await createSession(user.id);
  redirect(safeNext(next, l));
}

export async function logout(l: string) {
  await destroySession();
  redirect(`/${isLocale(l) ? l : "ar"}`);
}

export async function updateProfile(input: unknown): Promise<FormResult> {
  const id = await sessionUserId();
  if (!id) return { ok: false, errors: { form: "auth" } };
  const p = profileSchema.safeParse(input);
  if (!p.success) return { ok: false, errors: fieldErrors(p.error) };
  await db.user.update({ where: { id }, data: p.data });
  revalidatePath("/[locale]/account", "page");
  return { ok: true };
}

export async function changePassword(input: unknown): Promise<FormResult> {
  const id = await sessionUserId();
  if (!id) return { ok: false, errors: { form: "auth" } };
  const p = passwordSchema.safeParse(input);
  if (!p.success) return { ok: false, errors: fieldErrors(p.error) };
  const user = await db.user.findUnique({ where: { id } });
  if (!user || !(await bcrypt.compare(p.data.current, user.passwordHash))) return { ok: false, errors: { current: "wrongPassword" } };
  await db.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(p.data.next, 10) } });
  return { ok: true };
}
