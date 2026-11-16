import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

/** Local dev/tests use the SQLite file in DATABASE_URL; hosted deployments (Vercel) use Turso when TURSO_DATABASE_URL is set. */
export function createPrisma() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return new PrismaClient();
  return new PrismaClient({ adapter: new PrismaLibSQL({ url, authToken: process.env.TURSO_AUTH_TOKEN }) });
}
