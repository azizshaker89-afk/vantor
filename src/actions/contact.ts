"use server";
import { db } from "@/lib/db";
import { contactSchema, fieldErrors } from "@/lib/validation";
import type { FormResult } from "./auth";

export async function sendMessage(input: unknown): Promise<FormResult> {
  const p = contactSchema.safeParse(input);
  if (!p.success) return { ok: false, errors: fieldErrors(p.error) };
  await db.message.create({ data: { name: p.data.name, email: p.data.email, phone: p.data.phone || null, body: p.data.body } });
  return { ok: true };
}
