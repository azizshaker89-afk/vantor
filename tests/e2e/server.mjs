// Playwright webServer: reset the isolated e2e database, then run the production server in-process
// (a single node process, so shutdown is clean on every OS).
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const port = process.env.PORT ?? "3200";
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });

const require = createRequire(import.meta.url);
const next = require("next");
const http = require("node:http");
const app = next({ dev: false, port: Number(port) });
await app.prepare();
const handle = app.getRequestHandler();
http.createServer((req, res) => handle(req, res)).listen(Number(port), () => console.log(`e2e server on :${port}`));
