"use client";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useI18n } from "../I18nProvider";

export function FloatingActions({ whatsapp }: { whatsapp: string }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div className="fixed bottom-6 end-5 z-40 flex flex-col items-center gap-3 max-lg:bottom-20">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.misc.toTop}
        className={`grid size-11 place-items-center rounded-full bg-bone text-ink shadow-lg ring-1 ring-line transition-all duration-300 ${show ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
      >
        <ChevronUp className="size-5" strokeWidth={1.5} />
      </button>
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.misc.whatsapp}
        className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden>
          <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.67-1.74A12.96 12.96 0 0 0 16.04 29C23.2 29 29.04 23.18 29.04 16S23.2 3 16.04 3Zm0 23.7c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.96 1.03 1.06-3.86-.26-.4A10.66 10.66 0 0 1 5.34 16c0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7Zm5.87-8.01c-.32-.16-1.9-.94-2.2-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.58-1.6-.95-.85-1.6-1.9-1.79-2.22-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.43 5.45 4.81.76.33 1.36.53 1.82.67.77.24 1.46.2 2.01.12.61-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </a>
    </div>
  );
}
