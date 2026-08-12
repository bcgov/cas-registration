import { createVitestConfig } from "../../libs/testConfig/src/vitest/createVitestConfig";

export default createVitestConfig({
  rootDir: import.meta.dirname,
  appName: "administration",
  aliases: {
    "apps/administration/app": "./app",
    "apps/administration/tests": "./tests",
    "apps/dashboard/app": "../dashboard/app",
    "apps/registration/app": "../registration/app",
    "apps/reporting/src": "../reporting/src",
    "apps/compliance/src": "../compliance/src",
  },
  setupFiles: [
    "./tests/components/operators/mocks.ts",
    "./tests/components/contacts/mocks.ts",
  ],
});
