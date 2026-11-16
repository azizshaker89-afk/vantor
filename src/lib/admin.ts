import "server-only";
import { redirect } from "next/navigation";
import { currentUser } from "./auth";

/** For admin pages: bounce to the admin login unless the session belongs to an ADMIN. */
export async function requireAdmin() {
  const u = await currentUser();
  if (!u || u.role !== "ADMIN") redirect("/admin/login");
  return u;
}

/** For admin server actions: never trust that the caller came from a guarded page. */
export async function assertAdmin() {
  const u = await currentUser();
  if (!u || u.role !== "ADMIN") throw new Error("FORBIDDEN");
  return u;
}
