"use client";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Field, FormError, msg } from "../ui/Field";
import { changePassword, updateProfile, type FormResult } from "@/actions/auth";
import type { FieldErrors } from "@/lib/validation";

function useForm<T extends Record<string, string>>(init: T, action: (v: T) => Promise<FormResult>, resetOnOk = false) {
  const [v, setV] = useState(init);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  const bind = (k: keyof T) => ({
    value: v[k], error: errors[k as string],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setV((x) => ({ ...x, [k]: e.target.value })); setOk(false); setErrors((x) => ({ ...x, [k]: "" })); },
  });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await action(v);
      if (r.ok) { setOk(true); setErrors({}); if (resetOnOk) setV(init); } else setErrors(r.errors);
    });
  };
  return { bind, submit, ok, pending, errors };
}

export function ProfileForms({ name, phone, email }: { name: string; phone: string; email: string }) {
  const { t } = useI18n();
  const p = useForm({ name, phone }, updateProfile);
  const s = useForm({ current: "", next: "" }, changePassword, true);
  const card = "border border-line bg-bone p-6";
  const btn = (pending: boolean, ok: boolean, label: string, done: string) => (
    <div className="flex items-center gap-4">
      <button disabled={pending} className="btn-dark !py-2.5">{pending && <Loader2 className="size-4 animate-spin" />}{label}</button>
      {ok && <span className="text-sm text-[#3c6b3f]" role="status">{done}</span>}
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={p.submit} noValidate className={`${card} space-y-4`}>
        <h2 className="font-display text-xl">{t.account.profile}</h2>
        {p.errors.form && <FormError>{msg(t.errors, p.errors.form)}</FormError>}
        <Field label={t.auth.name} name="name" {...p.bind("name")} autoComplete="name" />
        <Field label={t.auth.phone} name="phone" type="tel" dir="ltr" {...p.bind("phone")} autoComplete="tel" />
        <Field label={t.auth.email} name="email" value={email} dir="ltr" readOnly disabled className="opacity-70" />
        {btn(p.pending, p.ok, t.account.save, t.account.saved)}
      </form>
      <form onSubmit={s.submit} noValidate className={`${card} space-y-4`}>
        <h2 className="font-display text-xl">{t.account.security}</h2>
        {s.errors.form && <FormError>{msg(t.errors, s.errors.form)}</FormError>}
        <Field label={t.account.current} name="current" type="password" dir="ltr" {...s.bind("current")} autoComplete="current-password" />
        <Field label={t.account.next} name="next" type="password" dir="ltr" {...s.bind("next")} autoComplete="new-password" />
        {btn(s.pending, s.ok, t.account.save, t.account.changed)}
      </form>
    </div>
  );
}
