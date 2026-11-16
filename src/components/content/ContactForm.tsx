"use client";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Field, TextArea } from "../ui/Field";
import { sendMessage } from "@/actions/contact";
import type { FieldErrors } from "@/lib/validation";

export function ContactForm() {
  const { t } = useI18n();
  const empty = { name: "", email: "", phone: "", body: "" };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const bind = (k: keyof typeof f) => ({
    value: f[k], error: errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF((v) => ({ ...v, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: "" })); },
  });

  if (sent)
    return (
      <div className="flex flex-col items-center border border-line bg-bone px-6 py-16 text-center" role="status">
        <CheckCircle2 className="size-12 text-brass" strokeWidth={1.2} />
        <p className="mt-4 font-display text-xl">{t.contactPage.sent}</p>
      </div>
    );

  return (
    <form
      noValidate
      className="grid gap-5 border border-line bg-bone p-6 md:grid-cols-2 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await sendMessage({ ...f, phone: f.phone.replace(/\s/g, "") });
          if (r.ok) { setSent(true); setF(empty); } else setErrors(r.errors);
        });
      }}
    >
      <Field label={t.contactPage.name} name="name" autoComplete="name" {...bind("name")} />
      <Field label={t.contactPage.email} name="email" type="email" dir="ltr" autoComplete="email" {...bind("email")} />
      <Field label={t.contactPage.phone} name="phone" type="tel" dir="ltr" placeholder="01xxxxxxxxx" autoComplete="tel" {...bind("phone")} className="md:col-span-2" />
      <TextArea label={t.contactPage.message} name="body" rows={5} maxLength={2000} {...bind("body")} className="md:col-span-2" />
      <div className="md:col-span-2">
        <button disabled={pending} className="btn-dark">
          {pending ? <><Loader2 className="size-4 animate-spin" />{t.contactPage.sending}</> : <><Send className="size-4 rtl:-scale-x-100" />{t.contactPage.send}</>}
        </button>
      </div>
    </form>
  );
}
