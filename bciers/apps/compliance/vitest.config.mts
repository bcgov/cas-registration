import { createVitestConfig } from "../../libs/testConfig/src/vitest/createVitestConfig";

export default createVitestConfig({
  rootDir: import.meta.dirname,
  appName: "compliance",
  aliases: {
    "apps/compliance/src": "./src",
    "apps/administration/app": "../administration/app",
    "apps/dashboard/app": "../dashboard/app",
    "apps/registration/app": "../registration/app",
    "apps/reporting/src": "../reporting/src",
  },
});
