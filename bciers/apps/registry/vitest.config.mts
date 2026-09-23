import { createVitestConfig } from "../../libs/testConfig/src/vitest/createVitestConfig";

export default createVitestConfig({
  rootDir: import.meta.dirname,
  appName: "registry",
  aliases: {
    "apps/registry/app": "./app",
    "apps/dashboard/app": "../dashboard/app",
  },
});
