/// <reference types='vitest' />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/administration",
  plugins: [react(), nxViteTsPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "apps/administration/app": path.resolve(__dirname, "./app"),
      "apps/administration/tests": path.resolve(__dirname, "./tests"),
      "apps/dashboard/app": path.resolve(__dirname, "../dashboard/app"),
      "apps/registration/app": path.resolve(__dirname, "../registration/app"),
      "apps/reporting/src": path.resolve(__dirname, "../reporting/src"),
      "apps/compliance/src": path.resolve(__dirname, "../compliance/src"),
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
