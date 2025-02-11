import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import path from "path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/administration",
  plugins: [react(), tsconfigPaths()],
  test: {
    testTimeout: 20000,
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "@/dashboard": path.resolve(__dirname, "../dashboard"),
      "@/administration": path.resolve(__dirname, "./"),
      "@/registration": path.resolve(__dirname, "../registration"),
      "@": path.resolve(__dirname, "./"),
      app: path.resolve(__dirname, "./app"),
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/administration",
      provider: "v8",
    },
    setupFiles: [
      "../../libs/testConfig/src/global.tsx",
      "./tests/components/operators/mocks.ts",
      "./tests/components/contacts/mocks.ts",
    ],
  },
});
