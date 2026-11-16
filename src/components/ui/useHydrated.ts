"use client";
import { useEffect, useState } from "react";

/** True after the first client render — use before showing persisted (localStorage) state. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
