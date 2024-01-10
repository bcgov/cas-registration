import { test, expect } from "@playwright/test";

import * as dotenv from "dotenv";
dotenv.config({
  path: "../e2e/.env.local",
});

// 👤 User Roles
import { UserRole } from "../../utils/enums";

// Access the baseURL made available to proces.env from `client/e2e/setup/global.ts`
const { BASEURL } = process.env;
// set the test url
const url = BASEURL + "home";

// 🏷 Annotate test suite as serial
test.describe.configure({ mode: "serial" });

test.describe("Test Home Page", () => {
  // ➰ Loop through the entries of UserRole enum
  for (const [role, value] of Object.entries(UserRole)) {
    const storageState = process.env[role + "_STORAGE"] || "";
    test.describe(`Test User Role - ${value}`, () => {
      test.use({ storageState: storageState });
      switch (value) {
        case UserRole.NEW_USER:
          break;
        case UserRole.CAS_ADMIN:
        case UserRole.CAS_ANALYST:
        case UserRole.CAS_PENDING:
          break;
        case UserRole.INDUSTRY_USER_ADMIN:
        case UserRole.INDUSTRY_USER:
          break;
      }
    });
  }
});
