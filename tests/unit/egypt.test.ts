import { describe, expect, it } from "vitest";
import { FREE_SHIPPING_OVER, GOVERNORATES, ZONES, shippingFor } from "@/lib/egypt";

describe("shippingFor", () => {
  it("charges the zone fee below the free threshold", () => {
    expect(shippingFor("cairo", 1000)).toBe(ZONES.metro.fee);
    expect(shippingFor("alexandria", 1000)).toBe(ZONES.north.fee);
    expect(shippingFor("aswan", 1000)).toBe(ZONES.south.fee);
    expect(shippingFor("south-sinai", 1000)).toBe(ZONES.remote.fee);
  });

  it("is free at and above the threshold", () => {
    expect(shippingFor("aswan", FREE_SHIPPING_OVER)).toBe(0);
    expect(shippingFor("cairo", FREE_SHIPPING_OVER + 1)).toBe(0);
    expect(shippingFor("cairo", FREE_SHIPPING_OVER - 1)).toBe(ZONES.metro.fee);
  });

  it("falls back to the most expensive zone for unknown ids", () => {
    expect(shippingFor("atlantis", 100)).toBe(ZONES.remote.fee);
  });

  it("covers all 27 governorates with unique ids", () => {
    expect(GOVERNORATES).toHaveLength(27);
    expect(new Set(GOVERNORATES.map((g) => g.id)).size).toBe(27);
  });
});
