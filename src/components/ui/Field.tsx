"use client";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "../I18nProvider";

type Common = { label: string; name: string; error?: string; className?: string; hint?: React.ReactNode };

export const fieldCls =
  "w-full border border-line bg-bone px-4 py-3 text-[0.95rem] outline-none transition-colors placeholder:text-smoke/60 focus:border-brass aria-[invalid=true]:border-sale";

/** Labelled input with inline error. `error` is a dict.errors key or a ready message. */
export function Field({ label, name, error, className = "", hint, type = "text", ...rest }: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const pw = type === "password";
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        <input
          id={id} name={name} type={pw && show ? "text" : type}
          aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
          className={`${fieldCls} ${pw ? "pe-16" : ""}`} {...rest}
        />
        {pw && (
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 end-0 flex items-center gap-1 px-3 text-xs text-smoke hover:text-ink" aria-label={show ? t.auth.hide : t.auth.show}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? <p id={`${id}-e`} role="alert" className="mt-1.5 text-xs text-sale">{msg(t.errors, error)}</p> : hint && <p className="mt-1.5 text-xs text-smoke">{hint}</p>}
    </div>
  );
}

export function TextArea({ label, name, error, className = "", ...rest }: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const { t } = useI18n();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <textarea id={id} name={name} aria-invalid={!!error} rows={4} className={`${fieldCls} resize-y`} {...rest} />
      {error && <p role="alert" className="mt-1.5 text-xs text-sale">{msg(t.errors, error)}</p>}
    </div>
  );
}

export function msg(errors: Record<string, unknown>, key: string): string {
  const v = errors[key];
  return typeof v === "string" ? v : typeof v === "function" ? String(v("")) : (errors.generic as string);
}

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="border-s-2 border-sale bg-sale/5 px-4 py-3 text-sm text-sale">{children}</p>;
}
