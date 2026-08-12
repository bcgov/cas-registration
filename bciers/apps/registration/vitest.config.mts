import { createVitestConfig } from "../../libs/testConfig/src/vitest/createVitestConfig";

export default createVitestConfig({
  rootDir: import.meta.dirname,
  appName: "registration",
  aliases: {
    "apps/registration/app": "./app",
    "apps/administration/app": "../administration/app",
    "apps/dashboard/app": "../dashboard/app",
    "apps/reporting/src": "../reporting/src",
    "apps/compliance/src": "../compliance/src",
  },
});
