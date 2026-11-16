"use client";
import { createContext, useContext } from "react";
import { getDict, type Dict, type Locale } from "@/i18n/dict";

const Ctx = createContext<{ l: Locale; t: Dict }>({ l: "ar", t: getDict("ar") });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ l: locale, t: getDict(locale) }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
