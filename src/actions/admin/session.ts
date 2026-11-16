"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export async function adminLogin(email: string, password: string): Promise<{ error: string } | void> {
  const user = await db.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  const ok = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!ok) return { error: "البريد أو كلمة السر غلط" };
  if (user.role !== "ADMIN") return { error: "الحساب ده مش عنده صلاحية دخول لوحة التحكم" };
  await createSession(user.id);
  redirect("/admin");
}

export async function adminLogout() {
  await destroySession();
  redirect("/admin/login");
}
