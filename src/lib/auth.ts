import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { cache } from "react";
import { db } from "./db";

// Stateless session: a signed JWT in an httpOnly cookie. Role is re-read from the DB on every request.
const COOKIE = "vantor_session";
const MAX_AGE = 60 * 60 * 24 * 30;
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-secret-change-me-please-32ch");

export async function createSession(userId: string) {
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(key());
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1", path: "/", maxAge: MAX_AGE });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function sessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Current user (without the password hash), memoised per request. */
export const currentUser = cache(async () => {
  const id = await sessionUserId();
  if (!id) return null;
  return db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true } });
});

/**
 * Page-level guard. Layouts render in parallel with pages and are not re-run on client navigation,
 * so every protected page checks the session itself.
 */
export async function requireUser(locale: string, next = `/${locale}/account`) {
  const u = await currentUser();
  if (!u) redirect(`/${locale}/login?next=${encodeURIComponent(next)}`);
  return u;
}
