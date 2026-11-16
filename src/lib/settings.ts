import "server-only";
import { cache } from "react";
import { db } from "./db";

export const DEFAULT_SETTINGS = { whatsapp: "201000000000", phone: "01000000000", email: "hello@vantor.store" };
export type StoreSettings = typeof DEFAULT_SETTINGS;

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const rows = await db.setting.findMany({ where: { key: { in: Object.keys(DEFAULT_SETTINGS) } } });
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
});

/** 01012345678 -> 0101 234 5678 */
export const prettyPhone = (p: string) => p.replace(/^(\d{4})(\d{3})(\d+)$/, "$1 $2 $3");
