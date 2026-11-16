import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { toCard } from "./queries";
import type { Locale } from "@/i18n/dict";
import type { CardProduct } from "./types";

export const SORTS = ["popular", "newest", "price-asc", "price-desc"] as const;
export type Sort = (typeof SORTS)[number];
export const PER_PAGE = [12, 24, 36] as const;

export interface CatalogQuery {
  cat?: string; // fixed by /c/[slug]
  cats: string[]; // ?cat=a,b on /shop
  brands: string[];
  q: string;
  min?: number;
  max?: number;
  stock: boolean;
  sale: boolean;
  sort: Sort;
  per: number;
  page: number;
}

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const list = (v: string | string[] | undefined) => one(v).split(",").map((s) => s.trim()).filter(Boolean);
const int = (v: string | string[] | undefined) => {
  const n = parseInt(one(v), 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Parse URL search params defensively: anything malformed falls back to a default. */
export function parseQuery(sp: SP, cat?: string): CatalogQuery {
  const sort = one(sp.sort) as Sort;
  const per = int(sp.per);
  return {
    cat,
    cats: cat ? [] : list(sp.cat),
    brands: list(sp.brand),
    q: one(sp.q).trim().slice(0, 80),
    min: int(sp.min),
    max: int(sp.max),
    stock: one(sp.stock) === "1",
    sale: one(sp.sale) === "1",
    sort: SORTS.includes(sort) ? sort : "popular",
    per: PER_PAGE.includes(per as 12) ? per! : 12,
    page: Math.max(1, int(sp.page) ?? 1),
  };
}

const orderBy: Record<Sort, Prisma.ProductOrderByWithRelationInput[]> = {
  popular: [{ sold: "desc" }, { id: "asc" }],
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  "price-asc": [{ price: "asc" }, { id: "asc" }],
  "price-desc": [{ price: "desc" }, { id: "asc" }],
};

export interface Facets {
  brands: { slug: string; name: string; count: number }[];
  categories: { slug: string; name: string; count: number; image: string }[];
  bounds: { min: number; max: number };
}

export interface CatalogResult {
  items: CardProduct[];
  total: number;
  page: number;
  pages: number;
  facets: Facets;
}

// Shoppers type the singular ("محفظة", "watch") while category names are plural, so map common words to categories.
const CATEGORY_WORDS: Record<string, string[]> = {
  watches: ["ساعه", "ساعة", "ساعات", "watch", "chrono", "كرونو"],
  sunglasses: ["نظاره", "نظارة", "نظارات", "شمس", "sunglass", "shades", "glasses"],
  wallets: ["محفظه", "محفظة", "محافظ", "wallet", "cardholder", "card holder"],
  bracelets: ["اسوره", "اسورة", "أسورة", "إسورة", "أساور", "اساور", "سوار", "bracelet", "cuff", "bangle"],
};
const categoriesFor = (q: string) => {
  const t = q.toLowerCase();
  return Object.entries(CATEGORY_WORDS).filter(([, words]) => words.some((w) => t.includes(w) || (t.length >= 3 && w.startsWith(t)))).map(([slug]) => slug);
};

function scopeWhere(q: string, cat?: string): Prisma.ProductWhereInput {
  const cats = q ? categoriesFor(q) : [];
  return {
    active: true,
    ...(cat ? { category: { slug: cat } } : {}),
    ...(q
      ? {
          OR: [
            { nameAr: { contains: q } }, { nameEn: { contains: q } },
            { descAr: { contains: q } }, { descEn: { contains: q } },
            { brand: { name: { contains: q } } },
            { category: { nameAr: { contains: q } } }, { category: { nameEn: { contains: q } } },
            ...(cats.length ? [{ category: { slug: { in: cats } } }] : []),
          ],
        }
      : {}),
  };
}

export async function runCatalog(query: CatalogQuery, l: Locale): Promise<CatalogResult> {
  // Scope = what the shopper is browsing (category page and/or search). Facet counts and price bounds come from here.
  const scope = scopeWhere(query.q, query.cat);

  // Each filter is kept separate so every facet can be counted with all *other* filters applied.
  const f = {
    cat: query.cats.length ? { category: { slug: { in: query.cats } } } : {},
    brand: query.brands.length ? { brand: { slug: { in: query.brands } } } : {},
    price: query.min != null || query.max != null ? { price: { gte: query.min, lte: query.max } } : {},
    stock: query.stock ? { stock: { gt: 0 } } : {},
    sale: query.sale ? { compareAt: { not: null } } : {},
  } satisfies Record<string, Prisma.ProductWhereInput>;
  const except = (k: keyof typeof f): Prisma.ProductWhereInput => ({
    AND: [scope, ...Object.entries(f).filter(([key]) => key !== k).map(([, v]) => v)],
  });
  const where: Prisma.ProductWhereInput = { AND: [scope, ...Object.values(f)] };

  const total = await db.product.count({ where });
  const pages = Math.max(1, Math.ceil(total / query.per));
  const page = Math.min(query.page, pages);

  const [rows, brandCounts, catCounts, bounds, brands, cats] = await Promise.all([
    db.product.findMany({
      where,
      include: { brand: true, category: true },
      orderBy: orderBy[query.sort],
      skip: (page - 1) * query.per,
      take: query.per,
    }),
    db.product.groupBy({ by: ["brandId"], where: except("brand"), _count: { _all: true } }),
    db.product.groupBy({ by: ["categoryId"], where: except("cat"), _count: { _all: true } }),
    db.product.aggregate({ where: scope, _min: { price: true }, _max: { price: true } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { sort: "asc" } }),
  ]);

  const bc = new Map(brandCounts.map((r) => [r.brandId, r._count._all]));
  const cc = new Map(catCounts.map((r) => [r.categoryId, r._count._all]));

  return {
    items: rows.map((p) => toCard(p, l)),
    total,
    page,
    pages,
    facets: {
      brands: brands.map((b) => ({ slug: b.slug, name: b.name, count: bc.get(b.id) ?? 0 })).filter((b) => b.count > 0 || query.brands.includes(b.slug)),
      categories: cats.map((c) => ({ slug: c.slug, name: l === "ar" ? c.nameAr : c.nameEn, count: cc.get(c.id) ?? 0, image: c.image })),
      bounds: { min: bounds._min.price ?? 0, max: bounds._max.price ?? 0 },
    },
  };
}

export async function getCategory(slug: string, l: Locale) {
  const c = await db.category.findUnique({ where: { slug } });
  if (!c) return null;
  return { slug: c.slug, name: l === "ar" ? c.nameAr : c.nameEn, desc: l === "ar" ? c.descAr : c.descEn, image: c.image };
}

const parse = <T,>(s: string, fallback: T): T => {
  try { return JSON.parse(s) as T; } catch { return fallback; }
};

/** Short, stable stock-keeping code derived from category + brand + id tail. */
const sku = (cat: string, brand: string, id: string) => `VT-${cat.slice(0, 2).toUpperCase()}${brand.slice(0, 2).toUpperCase()}-${id.slice(-4).toUpperCase()}`;

export async function getProduct(slug: string, l: Locale) {
  const p = await db.product.findUnique({ where: { slug }, include: { brand: true, category: true } });
  if (!p || !p.active) return null;
  const related = await db.product.findMany({
    where: { active: true, categoryId: p.categoryId, id: { not: p.id } },
    include: { brand: true, category: true },
    orderBy: [{ featured: "desc" }, { sold: "desc" }],
    take: 4,
  });
  const gallery = parse<string[]>(p.gallery, []);
  return {
    card: toCard(p, l),
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    brandSlug: p.brand.slug,
    brandTagline: l === "ar" ? p.brand.taglineAr : p.brand.taglineEn,
    categorySlug: p.category.slug,
    gallery: gallery.length ? gallery : [p.image],
    specs: parse<[string, string][]>(l === "ar" ? p.specsAr : p.specsEn, []),
    sku: sku(p.category.slug, p.brand.slug, p.id),
    sold: p.sold,
    related: related.map((r) => toCard(r, l)),
  };
}

export async function allProductSlugs() {
  return db.product.findMany({ where: { active: true }, select: { slug: true } });
}

export async function suggest(q: string, l: Locale) {
  const term = q.trim().slice(0, 80);
  if (!term) return [];
  const rows = await db.product.findMany({ where: scopeWhere(term), include: { brand: true, category: true }, orderBy: orderBy.popular, take: 6 });
  return rows.map((p) => toCard(p, l));
}
