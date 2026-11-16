"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "../I18nProvider";
import { Field, FormError, msg } from "../ui/Field";
import { Mark } from "../ui/Logo";
import { login, register } from "@/actions/auth";
import { adminLogin } from "@/actions/admin/session";
import { href } from "@/lib/format";
import type { FieldErrors } from "@/lib/validation";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const { l, t } = useI18n();
  const reg = mode === "register";
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, start] = useTransition();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: "", form: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      // On success the action redirects; we only get here with errors.
      const r = reg ? await register({ ...f, phone: f.phone.replace(/\s/g, "") }, l, next) : await login({ email: f.email, password: f.password }, l, next);
      if (r && !r.ok) setErrors(r.errors);
    });
  };

  const other = `${href(l, reg ? "/login" : "/register")}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="mx-auto grid max-w-[960px] overflow-hidden border border-line md:grid-cols-[0.9fr_1fr]">
      <div className="relative isolate flex flex-col justify-between gap-10 overflow-hidden bg-onyx p-8 text-bone md:p-10">
        <Mark className="absolute -bottom-16 -end-16 -z-10 size-72 text-brass/10" />
        <div>
          <Mark className="size-10 text-brass" />
          <h1 className="mt-6 font-display text-3xl">{reg ? t.auth.registerTitle : t.auth.loginTitle}</h1>
          <p className="mt-2 text-sm text-bone/70">{reg ? t.auth.registerBody : t.auth.loginBody}</p>
        </div>
        <ul className="space-y-3 text-sm text-bone/85">
          {t.auth.perks.map((p) => <li key={p} className="flex items-center gap-3"><Check className="size-4 text-brass" />{p}</li>)}
        </ul>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5 bg-bone p-8 md:p-10">
        {errors.form && <FormError>{msg(t.errors, errors.form)}</FormError>}
        {reg && <Field label={t.auth.name} name="name" value={f.name} onChange={set("name")} error={errors.name} autoComplete="name" required />}
        <Field label={t.auth.email} name="email" type="email" dir="ltr" value={f.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
        {reg && <Field label={t.auth.phone} name="phone" type="tel" inputMode="tel" dir="ltr" placeholder="01xxxxxxxxx" value={f.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" required />}
        <Field label={t.auth.password} name="password" type="password" dir="ltr" value={f.password} onChange={set("password")} error={errors.password} autoComplete={reg ? "new-password" : "current-password"} required />
        <button disabled={pending} className="btn-dark w-full !py-3.5">
          {pending && <Loader2 className="size-4 animate-spin" />}{reg ? t.auth.submitRegister : t.auth.submitLogin}
        </button>
        {!reg && (
          <button type="button" onClick={() => { setF((v) => ({ ...v, email: "demo@vantor.store", password: "Demo@1234" })); setErrors({}); }}
            className="flex w-full items-center justify-center gap-2 border border-dashed border-brass py-2.5 text-sm text-brass-deep hover:bg-brass-soft/15">
            <Sparkles className="size-4" />{t.auth.demo}: <span dir="ltr">demo@vantor.store</span>
          </button>
        )}
        {!reg && (
          <button type="button" disabled={pending}
            onClick={() => start(async () => { const r = await adminLogin("admin@vantor.store", "Admin@1234"); if (r) setErrors({ form: r.error }); })}
            className="flex w-full items-center justify-center gap-2 border border-dashed border-ink/40 py-2.5 text-sm text-ink hover:bg-ink/5">
            <ShieldCheck className="size-4" />{t.auth.demoAdmin}: <span dir="ltr">admin@vantor.store</span>
          </button>
        )}
        <p className="pt-2 text-center text-sm text-smoke">
          {reg ? t.auth.haveAccount : t.auth.noAccount}{" "}
          <Link href={other} className="font-semibold text-ink underline underline-offset-4 hover:text-brass-deep">{reg ? t.auth.toLogin : t.auth.toRegister}</Link>
        </p>
      </form>
    </div>
  );
}
