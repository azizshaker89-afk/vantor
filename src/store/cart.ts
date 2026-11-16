"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  coupon: string | null;
  setCoupon: (code: string | null) => void;
  /** Replace quantities after the server reports lower stock. */
  sync: (stock: { id: string; available: number }[]) => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      coupon: null,
      setCoupon: (coupon) => set({ coupon }),
      sync: (stock) =>
        set((s) => ({
          lines: s.lines
            .map((l) => { const x = stock.find((y) => y.id === l.id); return x ? { ...l, stock: x.available, qty: Math.min(l.qty, x.available) } : l; })
            .filter((l) => l.qty > 0),
        })),
      add: (line, qty = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.id === line.id);
          const lines = found
            ? s.lines.map((l) => (l.id === line.id ? { ...l, qty: Math.min(l.qty + qty, line.stock) } : l))
            : [...s.lines, { ...line, qty: Math.min(qty, line.stock) }];
          return { lines, open: true };
        }),
      setQty: (id, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, l.stock)) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [], coupon: null }),
      setOpen: (open) => set({ open }),
    }),
    { name: "vantor-cart", partialize: (s) => ({ lines: s.lines, coupon: s.coupon }) },
  ),
);

export const cartCount = (s: CartState) => s.lines.reduce((a, l) => a + l.qty, 0);
export const cartTotal = (s: CartState) => s.lines.reduce((a, l) => a + l.qty * l.price, 0);
