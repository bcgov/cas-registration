/// <reference types='vitest' />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import path from "node:path";

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/apps/reporting",
  plugins: [react(), nxViteTsPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "@bciers/hooks": path.resolve(import.meta.dirname, "../../libs/hooks/src/index.ts"),
      "apps/reporting/src": path.resolve(import.meta.dirname, "./src"),
      "apps/administration/app": path.resolve(
        import.meta.dirname,
        "../administration/app",
      ),
      "apps/dashboard/app": path.resolve(import.meta.dirname, "../dashboard/app"),
      "apps/registration/app": path.resolve(import.meta.dirname, "../registration/app"),
      "apps/compliance/src": path.resolve(import.meta.dirname, "../compliance/src"),
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/reporting",
      provider: "v8",
    },
    setupFiles: ["../../libs/testConfig/src/global.tsx"],
  },
});
