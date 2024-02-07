/**
 * 📖 https://playwright.dev/docs/test-fixtures
 * Fixtures help maintain code readability, reduce redundancy, and enhance the scalability of test suites
 * Fixtures reusable setups/teardowns for tests, providing a consistent environment for performing actions against web applications.
 *  */

import { test as base } from "@playwright/test";
import { HomePOM } from "@/e2e/poms/home";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// 📐 Define test fixtures
type TestFixtures = {
  user: string;
  password: string;
  role: string;
  loggedInPage: HomePOM;
};

// 💪 Extend base test with our fixtures
const test = base.extend<TestFixtures>({
  // Constants can be provided values through: test.use to parameterize a fixture
  user: "",
  password: "",
  role: "",
  // This fixture logs in new user
  loggedInPage: async ({ page, user, password, role }, use) => {
    const loggedInPage = new HomePOM(page);
    await loggedInPage.route();
    await loggedInPage.login(user, password, role);
    await loggedInPage.isLoggedIn();
    await use(loggedInPage);
  },
});

// ✨ Now test has these fixtures accessible to all test suites
export default test;
