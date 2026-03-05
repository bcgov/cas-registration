/// <reference types='vitest' />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/dashboard",
  plugins: [react(), nxViteTsPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "apps/dashboard/app": path.resolve(__dirname, "./app"),
      "apps/administration/app": path.resolve(__dirname, "../administration/app"),
      "apps/registration/app": path.resolve(__dirname, "../registration/app"),
      "apps/reporting/src": path.resolve(__dirname, "../reporting/src"),
      "apps/compliance/src": path.resolve(__dirname, "../compliance/src"),
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/dashboard",
      provider: "v8",
    },
    setupFiles: ["../../libs/testConfig/src/global.tsx"],
  },
});
