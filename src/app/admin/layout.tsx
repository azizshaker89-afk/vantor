import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "../fonts";
import { I18nProvider } from "@/components/I18nProvider";

export const metadata: Metadata = {
  title: { default: "لوحة التحكم", template: "%s | VANTOR Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#000000" };

// Separate root layout: the admin is Arabic-only and has none of the storefront chrome.
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVars}>
      <body className="min-h-dvh bg-stone">
        <I18nProvider locale="ar">{children}</I18nProvider>
      </body>
    </html>
  );
}
