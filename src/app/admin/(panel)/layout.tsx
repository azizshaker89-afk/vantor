import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [orders, messages] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.message.count({ where: { read: false } }),
  ]);
  return (
    <div className="lg:flex">
      <Sidebar name={user.name} badges={{ orders, messages }} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
