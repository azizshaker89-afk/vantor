import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
// The suite places orders and edits data, so it runs against its own seeded SQLite file.
const env = { DATABASE_URL: "file:./e2e.db", AUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-00", SITE_URL: `http://localhost:${PORT}` };

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${PORT}`, locale: "ar-EG", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    // Fresh schema + deterministic seed, then the production server. Requires `npm run build` first.
    command: "node tests/e2e/server.mjs",
    url: `http://localhost:${PORT}/ar`,
    reuseExistingServer: !!process.env.E2E_EXTERNAL_SERVER,
    timeout: 180_000,
    env: { ...env, PORT: String(PORT) },
    gracefulShutdown: { signal: "SIGTERM", timeout: 2000 },
  },
});
