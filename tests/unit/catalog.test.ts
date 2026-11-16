import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
const { parseQuery } = await import("@/lib/catalog");

describe("parseQuery", () => {
  it("falls back to safe defaults", () => {
    expect(parseQuery({})).toMatchObject({ sort: "popular", per: 12, page: 1, stock: false, sale: false, brands: [], q: "" });
  });

  it("parses lists, numbers and flags from the URL", () => {
    const q = parseQuery({ brand: "halden,corvane", min: "1000", max: "5000", stock: "1", sale: "1", sort: "price-asc", per: "24", page: "3", q: "  watch " });
    expect(q).toMatchObject({ brands: ["halden", "corvane"], min: 1000, max: 5000, stock: true, sale: true, sort: "price-asc", per: 24, page: 3, q: "watch" });
  });

  it("rejects values outside the allow-lists", () => {
    const q = parseQuery({ sort: "DROP TABLE", per: "1000", page: "-4" });
    expect(q).toMatchObject({ sort: "popular", per: 12, page: 1 });
  });

  it("ignores ?cat= on a category page (the path decides)", () => {
    expect(parseQuery({ cat: "wallets" }, "watches")).toMatchObject({ cat: "watches", cats: [] });
  });
});
