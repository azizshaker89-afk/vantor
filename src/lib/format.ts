import type { Locale } from "@/i18n/dict";

const nf = new Intl.NumberFormat("en-US");
export const money = (v: number, l: Locale) => (l === "ar" ? `${nf.format(v)} ج.م` : `${nf.format(v)} EGP`);
export const pct = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
export const href = (l: Locale, path: string) => `/${l}${path === "/" ? "" : path}`;
