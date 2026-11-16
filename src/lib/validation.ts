import { z } from "zod";
import { GOVERNORATES } from "./egypt";

// Messages are dictionary keys (see dict.errors) so client and server speak the same language.
export const phone = z.string().trim().regex(/^01[0125]\d{8}$/, "phone");
const name = z.string().trim().min(3, "name").max(60, "name");
const email = z.string().trim().toLowerCase().email("email").max(120, "email");
const password = z.string().min(8, "password").max(72, "password");

export const registerSchema = z.object({ name, email, phone, password });
export const loginSchema = z.object({ email, password: z.string().min(1, "required") });
export const profileSchema = z.object({ name, phone });
export const passwordSchema = z.object({ current: z.string().min(1, "required"), next: password });
export const contactSchema = z.object({
  name, email,
  phone: z.union([phone, z.literal("")]).optional(),
  body: z.string().trim().min(10, "message").max(2000, "message"),
});

export const checkoutSchema = z.object({
  name, phone,
  email: z.union([email, z.literal("")]).optional(),
  governorate: z.string().refine((g) => GOVERNORATES.some((x) => x.id === g), "governorate"),
  city: z.string().trim().min(2, "city").max(60, "city"),
  address: z.string().trim().min(8, "address").max(200, "address"),
  notes: z.string().trim().max(300).optional(),
  payment: z.enum(["COD", "CARD_ON_DELIVERY"]),
  coupon: z.string().trim().max(30).optional(),
  items: z.array(z.object({ id: z.string().min(1), qty: z.number().int().min(1).max(20) })).min(1, "empty").max(30),
});

export type FieldErrors = Record<string, string>;
export const fieldErrors = (e: z.ZodError): FieldErrors =>
  Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message]));
