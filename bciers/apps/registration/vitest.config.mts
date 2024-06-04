import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

import path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/registration',
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    alias: {
      '@': path.resolve(__dirname, './'),
      app: path.resolve(__dirname, './app'),
    },
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/registration',
      provider: 'v8',
    },
    setupFiles: ['../../libs/shared/testConfig/src/global.tsx'],
  },
});
