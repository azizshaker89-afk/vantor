import { describe, expect, it } from "vitest";
import { href, money, pct } from "@/lib/format";

describe("format", () => {
  it("formats money per locale with thousands separators", () => {
    expect(money(18900, "ar")).toBe("18,900 ج.م");
    expect(money(950, "en")).toBe("950 EGP");
  });

  it("computes a rounded discount only when compareAt is higher", () => {
    expect(pct(18900, 21500)).toBe(12);
    expect(pct(1000, 1000)).toBe(0);
    expect(pct(1000, null)).toBe(0);
    expect(pct(1000, 900)).toBe(0);
  });

  it("builds locale-prefixed paths", () => {
    expect(href("ar", "/")).toBe("/ar");
    expect(href("en", "/shop")).toBe("/en/shop");
  });
});
