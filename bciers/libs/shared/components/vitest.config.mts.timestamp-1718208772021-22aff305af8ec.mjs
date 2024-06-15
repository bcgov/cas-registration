// libs/shared/components/vitest.config.mts
import { defineConfig } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/vite/dist/node/index.js";
import react from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { nxViteTsPaths } from "file:///home/shon/Workspaces/CAS/cas-registration/bciers/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js";
var __vite_injected_original_dirname = "/home/shon/Workspaces/CAS/cas-registration/bciers/libs/shared/components";
var vitest_config_default = defineConfig({
  root: __vite_injected_original_dirname,
  cacheDir: "../../../node_modules/.vite/libs/shared/components",
  plugins: [react(), nxViteTsPaths()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "../../../coverage/libs/shared/components",
      provider: "v8"
    },
    setupFiles: ["../testConfig/src/global.tsx"]
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGlicy9zaGFyZWQvY29tcG9uZW50cy92aXRlc3QuY29uZmlnLm10cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvbGlicy9zaGFyZWQvY29tcG9uZW50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvc2hvbi9Xb3Jrc3BhY2VzL0NBUy9jYXMtcmVnaXN0cmF0aW9uL2JjaWVycy9saWJzL3NoYXJlZC9jb21wb25lbnRzL3ZpdGVzdC5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Nob24vV29ya3NwYWNlcy9DQVMvY2FzLXJlZ2lzdHJhdGlvbi9iY2llcnMvbGlicy9zaGFyZWQvY29tcG9uZW50cy92aXRlc3QuY29uZmlnLm10c1wiOy8vLyA8cmVmZXJlbmNlIHR5cGVzPSd2aXRlc3QnIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gXCJAbngvdml0ZS9wbHVnaW5zL254LXRzY29uZmlnLXBhdGhzLnBsdWdpblwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBfX2Rpcm5hbWUsXG4gIGNhY2hlRGlyOiBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8udml0ZS9saWJzL3NoYXJlZC9jb21wb25lbnRzXCIsXG5cbiAgcGx1Z2luczogW3JlYWN0KCksIG54Vml0ZVRzUGF0aHMoKV0sXG5cbiAgLy8gVW5jb21tZW50IHRoaXMgaWYgeW91IGFyZSB1c2luZyB3b3JrZXJzLlxuICAvLyB3b3JrZXI6IHtcbiAgLy8gIHBsdWdpbnM6IFsgbnhWaXRlVHNQYXRocygpIF0sXG4gIC8vIH0sXG5cbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgICBpbmNsdWRlOiBbXCJzcmMvKiovKi57dGVzdCxzcGVjfS57anMsbWpzLGNqcyx0cyxtdHMsY3RzLGpzeCx0c3h9XCJdLFxuICAgIHJlcG9ydGVyczogW1wiZGVmYXVsdFwiXSxcbiAgICBjb3ZlcmFnZToge1xuICAgICAgcmVwb3J0c0RpcmVjdG9yeTogXCIuLi8uLi8uLi9jb3ZlcmFnZS9saWJzL3NoYXJlZC9jb21wb25lbnRzXCIsXG4gICAgICBwcm92aWRlcjogXCJ2OFwiLFxuICAgIH0sXG4gICAgc2V0dXBGaWxlczogW1wiLi4vdGVzdENvbmZpZy9zcmMvZ2xvYmFsLnRzeFwiXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLHFCQUFxQjtBQUg5QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixVQUFVO0FBQUEsRUFFVixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFPbEMsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLHNEQUFzRDtBQUFBLElBQ2hFLFdBQVcsQ0FBQyxTQUFTO0FBQUEsSUFDckIsVUFBVTtBQUFBLE1BQ1Isa0JBQWtCO0FBQUEsTUFDbEIsVUFBVTtBQUFBLElBQ1o7QUFBQSxJQUNBLFlBQVksQ0FBQyw4QkFBOEI7QUFBQSxFQUM3QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
