// Runs the Playwright suite against a server this script owns, then always stops it.
// (Playwright's own webServer teardown can hang on Windows; CI on Linux may use either path.)
import { spawn, spawnSync, execSync } from "node:child_process";

const PORT = 3200;
const env = { ...process.env, PORT: String(PORT), DATABASE_URL: "file:./e2e.db", AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-00", SITE_URL: `http://localhost:${PORT}` };
const server = spawn(process.execPath, ["tests/e2e/server.mjs"], { env, stdio: ["ignore", "inherit", "inherit"] });

const stop = () => {
  if (server.exitCode !== null) return;
  if (process.platform === "win32") { try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: "ignore" }); } catch {} }
  else server.kill("SIGTERM");
};
process.on("exit", stop);
process.on("SIGINT", () => process.exit(130));

const deadline = Date.now() + 180_000;
while (true) {
  try { if ((await fetch(`http://localhost:${PORT}/ar`)).ok) break; } catch {}
  if (server.exitCode !== null || Date.now() > deadline) { console.error("e2e server failed to start"); process.exit(1); }
  await new Promise((r) => setTimeout(r, 1000));
}

const r = spawnSync("npx", ["playwright", "test", ...process.argv.slice(2)], { stdio: "inherit", shell: true, env: { ...process.env, E2E_EXTERNAL_SERVER: "1" } });
process.exit(r.status ?? 1);
