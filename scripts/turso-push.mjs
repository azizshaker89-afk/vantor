// Creates the schema on Turso (prisma db push can't talk to libsql directly).
// Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/turso-push.mjs
import { execSync } from "node:child_process";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
const sql = execSync("npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script", { encoding: "utf8" });
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
const tables = (await client.execute("SELECT name FROM sqlite_master WHERE type='table'")).rows;
if (tables.some((r) => r.name === "Product")) {
  console.log("Schema already exists, skipping.");
} else {
  await client.executeMultiple(sql);
  console.log("Schema created.");
}
