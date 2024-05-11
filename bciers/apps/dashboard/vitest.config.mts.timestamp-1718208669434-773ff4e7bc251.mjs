// apps/dashboard/vitest.config.mts
import { defineConfig } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vitest/dist/config.js";
import react from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tsconfigPaths from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vite-tsconfig-paths/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/home/shon/Workspaces/CAS/cas-registration/bciers/apps/dashboard";
var vitest_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: "../../node_modules/.vite/apps/dashboard",
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    alias: {
      "@/dashboard": path.resolve(__vite_injected_original_dirname, "../dashboard/src/"),
      app: path.resolve(__vite_injected_original_dirname, "./app")
    },
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/dashboard",
      provider: "v8"
    },
    setupFiles: ["../../libs/shared/testConfig/src/global.tsx"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy9kYXNoYm9hcmQvdml0ZXN0LmNvbmZpZy5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9zaG9uL1dvcmtzcGFjZXMvQ0FTL2Nhcy1yZWdpc3RyYXRpb24vYmNpZXJzL2FwcHMvZGFzaGJvYXJkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9zaG9uL1dvcmtzcGFjZXMvQ0FTL2Nhcy1yZWdpc3RyYXRpb24vYmNpZXJzL2FwcHMvZGFzaGJvYXJkL3ZpdGVzdC5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvYXBwcy9kYXNoYm9hcmQvdml0ZXN0LmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZXN0L2NvbmZpZ1wiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcblxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogX19kaXJuYW1lLFxuICBjYWNoZURpcjogXCIuLi8uLi9ub2RlX21vZHVsZXMvLnZpdGUvYXBwcy9kYXNoYm9hcmRcIixcbiAgcGx1Z2luczogW3JlYWN0KCksIHRzY29uZmlnUGF0aHMoKV0sXG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgaW5jbHVkZTogW1wiKiovKi57dGVzdCxzcGVjfS57anMsbWpzLGNqcyx0cyxtdHMsY3RzLGpzeCx0c3h9XCJdLFxuICAgIGV4Y2x1ZGU6IFtcIm5vZGVfbW9kdWxlc1wiLCBcImRpc3RcIiwgXCJlMmVcIl0sXG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQC9kYXNoYm9hcmRcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuLi9kYXNoYm9hcmQvc3JjL1wiKSxcbiAgICAgIGFwcDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL2FwcFwiKSxcbiAgICB9LFxuICAgIHJlcG9ydGVyczogW1wiZGVmYXVsdFwiXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcmVwb3J0c0RpcmVjdG9yeTogXCIuLi8uLi9jb3ZlcmFnZS9hcHBzL2Rhc2hib2FyZFwiLFxuICAgICAgcHJvdmlkZXI6IFwidjhcIixcbiAgICB9LFxuICAgIHNldHVwRmlsZXM6IFtcIi4uLy4uL2xpYnMvc2hhcmVkL3Rlc3RDb25maWcvc3JjL2dsb2JhbC50c3hcIl0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1gsU0FBUyxvQkFBb0I7QUFDclosT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBRTFCLE9BQU8sVUFBVTtBQUpqQixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixVQUFVO0FBQUEsRUFDVixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ2xDLE1BQU07QUFBQSxJQUNKLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQyxrREFBa0Q7QUFBQSxJQUM1RCxTQUFTLENBQUMsZ0JBQWdCLFFBQVEsS0FBSztBQUFBLElBQ3ZDLE9BQU87QUFBQSxNQUNMLGVBQWUsS0FBSyxRQUFRLGtDQUFXLG1CQUFtQjtBQUFBLE1BQzFELEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLElBQ0EsV0FBVyxDQUFDLFNBQVM7QUFBQSxJQUNyQixVQUFVO0FBQUEsTUFDUixrQkFBa0I7QUFBQSxNQUNsQixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsWUFBWSxDQUFDLDZDQUE2QztBQUFBLEVBQzVEO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
