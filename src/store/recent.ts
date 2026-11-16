"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Locale-neutral snapshot so the strip renders in either language. */
export interface RecentItem {
  id: string;
  slug: string;
  image: string;
  price: number;
  compareAt: number | null;
  brand: string;
  nameAr: string;
  nameEn: string;
}

export const useRecent = create<{ items: RecentItem[]; push: (i: RecentItem) => void }>()(
  persist(
    (set) => ({
      items: [],
      push: (i) => set((s) => ({ items: [i, ...s.items.filter((x) => x.id !== i.id)].slice(0, 10) })),
    }),
    { name: "vantor-recent" },
  ),
);
