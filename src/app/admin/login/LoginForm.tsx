"use client";
import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Field, FormError } from "@/components/ui/Field";
import { adminLogin } from "@/actions/admin/session";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await adminLogin(email, password); if (r) setError(r.error); }); }}
    >
      <FormError>{error}</FormError>
      <Field label="البريد الإلكتروني" name="email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
      <Field label="كلمة السر" name="password" type="password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      <button disabled={pending} className="btn-dark w-full !py-3.5">{pending && <Loader2 className="size-4 animate-spin" />}دخول</button>
      <button type="button" onClick={() => { setEmail("admin@vantor.store"); setPassword("Admin@1234"); setError(""); }}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-brass py-2.5 text-sm text-brass-deep hover:bg-brass-soft/15">
        <Sparkles className="size-4" />بيانات الأدمن التجريبية
      </button>
    </form>
  );
}
