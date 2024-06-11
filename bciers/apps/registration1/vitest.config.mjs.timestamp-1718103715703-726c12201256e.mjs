// apps/registration1/vitest.config.mjs
import { defineConfig } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vitest/dist/config.js";
import react from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tsconfigPaths from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vite-tsconfig-paths/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/shon/Workspaces/CAS/cas-registration/bciers/apps/registration1";
var vitest_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: "../../node_modules/.vite/apps/registration1",
  plugins: [react(), tsconfigPaths({ root: "../../" })],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "@/dashboard": path.resolve(__vite_injected_original_dirname, "../dashboard/src/"),
      "@": path.resolve(__vite_injected_original_dirname, "./"),
      app: path.resolve(__vite_injected_original_dirname, "./app")
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/registration1",
      provider: "v8"
    },
    setupFiles: ["../../libs/shared/testConfig/src/global.tsx"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy9yZWdpc3RyYXRpb24xL3ZpdGVzdC5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvc2hvbi9Xb3Jrc3BhY2VzL0NBUy9jYXMtcmVnaXN0cmF0aW9uL2JjaWVycy9hcHBzL3JlZ2lzdHJhdGlvbjFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvYXBwcy9yZWdpc3RyYXRpb24xL3ZpdGVzdC5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvYXBwcy9yZWdpc3RyYXRpb24xL3ZpdGVzdC5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVzdC9jb25maWdcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5cbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHJvb3Q6IF9fZGlybmFtZSxcbiAgY2FjaGVEaXI6IFwiLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL2FwcHMvcmVnaXN0cmF0aW9uMVwiLFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgdHNjb25maWdQYXRocyh7IHJvb3Q6IFwiLi4vLi4vXCIgfSldLFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIGluY2x1ZGU6IFtcIioqLyoue3Rlc3Qsc3BlY30ue2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fVwiXSxcbiAgICBleGNsdWRlOiBbXCJub2RlX21vZHVsZXNcIiwgXCJkaXN0XCIsIFwiZTJlXCJdLFxuICAgIGFsaWFzOiB7XG4gICAgICBcIkAvZGFzaGJvYXJkXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vZGFzaGJvYXJkL3NyYy9cIiksXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL1wiKSxcbiAgICAgIGFwcDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL2FwcFwiKSxcbiAgICB9LFxuICAgIHJlcG9ydGVyczogW1wiZGVmYXVsdFwiXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcmVwb3J0c0RpcmVjdG9yeTogXCIuLi8uLi9jb3ZlcmFnZS9hcHBzL3JlZ2lzdHJhdGlvbjFcIixcbiAgICAgIHByb3ZpZGVyOiBcInY4XCIsXG4gICAgfSxcbiAgICBzZXR1cEZpbGVzOiBbXCIuLi8uLi9saWJzL3NoYXJlZC90ZXN0Q29uZmlnL3NyYy9nbG9iYWwudHN4XCJdLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9ZLFNBQVMsb0JBQW9CO0FBQ2phLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUUxQixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsTUFBTTtBQUFBLEVBQ04sVUFBVTtBQUFBLEVBQ1YsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLEVBQUUsTUFBTSxTQUFTLENBQUMsQ0FBQztBQUFBLEVBQ3BELE1BQU07QUFBQSxJQUNKLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxrREFBa0Q7QUFBQSxJQUM1RCxTQUFTLENBQUMsZ0JBQWdCLFFBQVEsS0FBSztBQUFBLElBQ3ZDLE9BQU87QUFBQSxNQUNMLGVBQWUsS0FBSyxRQUFRLGtDQUFXLG1CQUFtQjtBQUFBLE1BQzFELEtBQUssS0FBSyxRQUFRLGtDQUFXLElBQUk7QUFBQSxNQUNqQyxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxJQUNBLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDckIsVUFBVTtBQUFBLE1BQ1Isa0JBQWtCO0FBQUEsTUFDbEIsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLFlBQVksQ0FBQyw2Q0FBNkM7QUFBQSxFQUM1RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
