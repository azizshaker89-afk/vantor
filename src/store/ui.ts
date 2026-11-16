"use client";
import { create } from "zustand";
import type { CardProduct } from "@/lib/types";

type Panel = null | "menu" | "search" | "filters";
interface UIState {
  panel: Panel;
  setPanel: (p: Panel) => void;
  quick: CardProduct | null;
  setQuick: (p: CardProduct | null) => void;
}
export const useUI = create<UIState>((set) => ({
  panel: null,
  setPanel: (panel) => set({ panel }),
  quick: null,
  setQuick: (quick) => set({ quick }),
}));
