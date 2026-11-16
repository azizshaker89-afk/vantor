import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  css: { postcss: { plugins: [] } }, // keep Vite from loading the Tailwind PostCSS config
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside the React server condition; it's a no-op for unit tests.
      "server-only": path.resolve(__dirname, "tests/unit/stub.ts"),
    },
  },
});
