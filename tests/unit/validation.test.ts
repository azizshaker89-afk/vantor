import { describe, expect, it } from "vitest";
import { checkoutSchema, contactSchema, fieldErrors, phone, registerSchema } from "@/lib/validation";

const order = {
  name: "يوسف أحمد", phone: "01012345678", email: "", governorate: "cairo", city: "مدينة نصر",
  address: "12 شارع عباس العقاد", payment: "COD", items: [{ id: "p1", qty: 1 }],
};

describe("phone", () => {
  it.each(["01012345678", "01112345678", "01212345678", "01512345678"])("accepts %s", (p) => expect(phone.safeParse(p).success).toBe(true));
  it.each(["0101234567", "01312345678", "+201012345678", "abc"])("rejects %s", (p) => expect(phone.safeParse(p).success).toBe(false));
});

describe("checkoutSchema", () => {
  it("accepts a complete COD order", () => expect(checkoutSchema.safeParse(order).success).toBe(true));

  it("maps failures to dictionary keys per field", () => {
    const r = checkoutSchema.safeParse({ ...order, phone: "123", governorate: "mars", address: "x", items: [] });
    expect(r.success).toBe(false);
    if (!r.success) expect(fieldErrors(r.error)).toMatchObject({ phone: "phone", governorate: "governorate", address: "address", items: "empty" });
  });

  it("caps quantities and rejects unknown payment methods", () => {
    expect(checkoutSchema.safeParse({ ...order, items: [{ id: "p1", qty: 99 }] }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...order, payment: "CRYPTO" }).success).toBe(false);
  });
});

describe("registerSchema / contactSchema", () => {
  it("normalises email and enforces password length", () => {
    const ok = registerSchema.safeParse({ name: "Omar", email: "  Omar@Example.COM ", phone: "01012345678", password: "longenough" });
    expect(ok.success && ok.data.email).toBe("omar@example.com");
    expect(registerSchema.safeParse({ name: "Omar", email: "o@e.com", phone: "01012345678", password: "short" }).success).toBe(false);
  });

  it("allows an empty optional phone on contact", () => {
    expect(contactSchema.safeParse({ name: "Omar", email: "o@e.com", phone: "", body: "I have a question about sizing." }).success).toBe(true);
  });
});
