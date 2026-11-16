import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "دخول الأدمن" };

export default async function AdminLogin() {
  const u = await currentUser();
  if (u?.role === "ADMIN") redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center bg-onyx px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-bone [&_span.text-ink]:text-bone">
          <Logo />
          <p className="text-xs tracking-[0.3em] text-brass-soft">ADMIN</p>
        </div>
        <div className="bg-bone p-8"><LoginForm /></div>
      </div>
    </main>
  );
}
