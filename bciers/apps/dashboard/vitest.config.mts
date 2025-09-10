import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

import path from "path";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/dashboard",
  plugins: [react(), tsconfigPaths()] as any, // type: ignore - Vitest has incompatible types with Vite plugins
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "@/dashboard": path.resolve(__dirname, "../dashboard"),
      app: path.resolve(__dirname, "./app"),
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/dashboard",
      provider: "v8",
    },
    setupFiles: ["../../libs/testConfig/src/global.tsx"],
  },
});
