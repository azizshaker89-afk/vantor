import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
vi.mock("@/lib/db", () => ({ db: { coupon: { findUnique: (...a: unknown[]) => findUnique(...a) } } }));
const { evaluateCoupon } = await import("@/lib/coupons");

const base = { active: true, expiresAt: null, minTotal: 0 };

describe("evaluateCoupon", () => {
  beforeEach(() => findUnique.mockReset());

  it("applies a percentage, rounded, and upper-cases the code", async () => {
    findUnique.mockResolvedValue({ ...base, code: "VANTOR10", type: "PERCENT", value: 10 });
    expect(await evaluateCoupon(" vantor10 ", 1895)).toMatchObject({ ok: true, code: "VANTOR10", discount: 190 });
    expect(findUnique).toHaveBeenCalledWith({ where: { code: "VANTOR10" } });
  });

  it("never discounts more than the subtotal for fixed amounts", async () => {
    findUnique.mockResolvedValue({ ...base, code: "BIG", type: "FIXED", value: 500 });
    expect(await evaluateCoupon("BIG", 300)).toMatchObject({ ok: true, discount: 300 });
  });

  it("reports unknown, inactive, expired and below-minimum codes", async () => {
    findUnique.mockResolvedValue(null);
    expect(await evaluateCoupon("NOPE", 5000)).toEqual({ ok: false, reason: "invalid" });
    findUnique.mockResolvedValue({ ...base, active: false, type: "PERCENT", value: 10 });
    expect(await evaluateCoupon("OFF", 5000)).toEqual({ ok: false, reason: "invalid" });
    findUnique.mockResolvedValue({ ...base, expiresAt: new Date("2000-01-01"), type: "PERCENT", value: 10 });
    expect(await evaluateCoupon("OLD", 5000)).toEqual({ ok: false, reason: "expired" });
    findUnique.mockResolvedValue({ ...base, minTotal: 2000, type: "FIXED", value: 200 });
    expect(await evaluateCoupon("MIN", 1500)).toEqual({ ok: false, reason: "min", min: 2000 });
  });

  it("rejects empty input without hitting the database", async () => {
    expect(await evaluateCoupon("   ", 5000)).toEqual({ ok: false, reason: "invalid" });
    expect(findUnique).not.toHaveBeenCalled();
  });
});
