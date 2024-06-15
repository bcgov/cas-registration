// apps/reporting/vitest.config.mts
import { defineConfig } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vite/dist/node/index.js";
import react from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nxViteTsPaths } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
var __vite_injected_original_dirname = "/home/shon/Workspaces/CAS/cas-registration/bciers/apps/reporting";
var vitest_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: "../../node_modules/.vite/apps/reporting",
  plugins: [react(), nxViteTsPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "{test,src,spec}**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"
    ],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../coverage/apps/reporting",
      provider: "v8"
    },
    setupFiles: ["../../libs/shared/testConfig/src/global.tsx"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy9yZXBvcnRpbmcvdml0ZXN0LmNvbmZpZy5tdHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9zaG9uL1dvcmtzcGFjZXMvQ0FTL2Nhcy1yZWdpc3RyYXRpb24vYmNpZXJzL2FwcHMvcmVwb3J0aW5nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9zaG9uL1dvcmtzcGFjZXMvQ0FTL2Nhcy1yZWdpc3RyYXRpb24vYmNpZXJzL2FwcHMvcmVwb3J0aW5nL3ZpdGVzdC5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvYXBwcy9yZXBvcnRpbmcvdml0ZXN0LmNvbmZpZy5tdHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz0ndml0ZXN0JyAvPlxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IG54Vml0ZVRzUGF0aHMgfSBmcm9tIFwiQG54L3ZpdGUvcGx1Z2lucy9ueC10c2NvbmZpZy1wYXRocy5wbHVnaW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcm9vdDogX19kaXJuYW1lLFxuICBjYWNoZURpcjogXCIuLi8uLi9ub2RlX21vZHVsZXMvLnZpdGUvYXBwcy9yZXBvcnRpbmdcIixcblxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbnhWaXRlVHNQYXRocygpXSxcblxuICAvLyBVbmNvbW1lbnQgdGhpcyBpZiB5b3UgYXJlIHVzaW5nIHdvcmtlcnMuXG4gIC8vIHdvcmtlcjoge1xuICAvLyAgcGx1Z2luczogWyBueFZpdGVUc1BhdGhzKCkgXSxcbiAgLy8gfSxcblxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogXCJqc2RvbVwiLFxuICAgIGluY2x1ZGU6IFtcbiAgICAgIFwie3Rlc3Qsc3JjLHNwZWN9KiovKi57dGVzdCxzcGVjfS57anMsbWpzLGNqcyx0cyxtdHMsY3RzLGpzeCx0c3h9XCIsXG4gICAgXSxcbiAgICByZXBvcnRlcnM6IFtcImRlZmF1bHRcIl0sXG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIHJlcG9ydHNEaXJlY3Rvcnk6IFwiLi4vLi4vY292ZXJhZ2UvYXBwcy9yZXBvcnRpbmdcIixcbiAgICAgIHByb3ZpZGVyOiBcInY4XCIsXG4gICAgfSxcbiAgICBzZXR1cEZpbGVzOiBbXCIuLi8uLi9saWJzL3NoYXJlZC90ZXN0Q29uZmlnL3NyYy9nbG9iYWwudHN4XCJdLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMscUJBQXFCO0FBSDlCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sd0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFVBQVU7QUFBQSxFQUVWLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9sQyxNQUFNO0FBQUEsSUFDSixTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsTUFDUDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDckIsVUFBVTtBQUFBLE1BQ1Isa0JBQWtCO0FBQUEsTUFDbEIsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLFlBQVksQ0FBQyw2Q0FBNkM7QUFBQSxFQUM1RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
