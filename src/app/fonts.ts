import { El_Messiri, Manrope, Marcellus, Tajawal } from "next/font/google";

export const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", display: "swap" });
export const messiri = El_Messiri({ subsets: ["arabic", "latin"], weight: ["400", "500", "600"], variable: "--font-messiri", display: "swap" });
export const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-tajawal", display: "swap" });
export const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });

export const fontVars = [marcellus.variable, messiri.variable, tajawal.variable, manrope.variable].join(" ");
