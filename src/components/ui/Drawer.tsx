"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useI18n } from "../I18nProvider";

/** Side panel that slides in from the inline-end edge (left in Arabic, right in English). */
export function Drawer({
  open, onClose, title, side = "end", children, footer,
}: {
  open: boolean; onClose: () => void; title: string; side?: "start" | "end"; children: React.ReactNode; footer?: React.ReactNode;
}) {
  const { t, l } = useI18n();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, onClose]);

  // In RTL the inline-end edge is the left side.
  const fromLeft = (side === "end") === (l === "ar");
  const hidden = fromLeft ? "-translate-x-full" : "translate-x-full";

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-onyx/55 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute top-0 bottom-0 ${fromLeft ? "left-0" : "right-0"} flex w-[min(420px,88vw)] flex-col bg-bone shadow-2xl outline-none transition-transform duration-500 ease-[var(--ease-dial)] ${open ? "translate-x-0" : hidden}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-smoke hover:text-ink">
            <X className="size-4" strokeWidth={1.5} /> {t.header.close}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer}
      </div>
    </div>
  );
}
