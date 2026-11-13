import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/libs/components",
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/libs/components",
      provider: "v8",
    },
    // Reuse the environment and cached packages across test files; resetBetweenFiles gives each file fresh
    // app modules and mocks (see that file)
    isolate: false,
    setupFiles: [
      "../../libs/testConfig/src/resetBetweenFiles.ts",
      "../../libs/testConfig/src/global.tsx",
    ],
  },
});
