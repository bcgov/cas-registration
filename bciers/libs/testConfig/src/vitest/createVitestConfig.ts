/// <reference types='vitest' />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import path from "node:path";

interface CreateVitestConfigOptions {
  // Each app passes its own `import.meta.dirname` so relative paths below
  // resolve against the calling app, not this shared file.
  rootDir: string;
  appName: string;
  aliases: Record<string, string>;
  setupFiles?: string[];
}

export function createVitestConfig({
  rootDir,
  appName,
  aliases,
  setupFiles = [],
}: CreateVitestConfigOptions) {
  return defineConfig({
    root: rootDir,
    cacheDir: `../../node_modules/.vite/apps/${appName}`,
    plugins: [react(), nxViteTsPaths()],
    test: {
      globals: true,
      environment: "jsdom",
      include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["node_modules", "dist", "e2e"],
      alias: Object.fromEntries(
        Object.entries(aliases).map(([key, relativeTarget]) => [
          key,
          path.resolve(rootDir, relativeTarget),
        ]),
      ),
      reporters: ["default"],
      coverage: {
        reportsDirectory: `../../coverage/apps/${appName}`,
        provider: "v8",
      },
      setupFiles: ["../../libs/testConfig/src/global.tsx", ...setupFiles],
    },
  });
}
