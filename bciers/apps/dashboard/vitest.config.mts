import { createVitestConfig } from "../../libs/testConfig/src/vitest/createVitestConfig";

export default createVitestConfig({
  rootDir: import.meta.dirname,
  appName: "dashboard",
  aliases: {
    "apps/dashboard/app": "./app",
    "apps/administration/app": "../administration/app",
    "apps/registration/app": "../registration/app",
    "apps/reporting/src": "../reporting/src",
    "apps/compliance/src": "../compliance/src",
  },
});
