# Playwright Testing Guidelines

## Introduction

Playwright is a powerful end-to-end testing library for web applications. It provides a simple API to automate browser actions, allowing developers to create robust and maintainable tests.

## Getting Started

To get started with Playwright, you'll need to install it as a dependency in your project:

```bash
cd bc_obps && make run
npm install @playwright/test
```

Ensure you have the correct env variables set up in the `bciers/.env.local` file. You can copy the `.env.local.example` file and update the values accordingly.

## Test organization in our monorepo

The e2e tests are organized in separate projects in the `/bciers/apps` directory. Each project has its own `e2e` directory where the tests are located. To run the tests we need to have the `Dashboard` app running due to our auth implementation alongside whichever app we are testing. There are shared utilities in the `bciers/libs/e2e` directory that can be used across all e2e tests.

## Writing Tests

### Basic Test Structure

Playwright tests follow a simple structure. Each test case is a JavaScript or TypeScript function with Playwright APIs for interacting with the browser.

```javascript
const { test } = require("@playwright/test");
test("Example Test", async ({ page }) => {
  // Your test logic goes here
});
```

### Locators

#### Prefer User-Facing Attributes

When selecting elements, prefer using user-facing attributes over XPath or CSS selectors. This ensures that the tests are tied to the actual user experience and are less prone to breakage when the underlying structure changes.

```javascript
// Bad: Using XPath
await page.click('//div[@class="my-button"]');
// Good: Using User-Facing Attribute
await page.click('[data-testid="my-button"]');
```

#### Code Generation

To find locators, leverage Playwright's code generation feature. Use the following command to record user actions and generate test code:

```bash
cd bciers && npx playwright codegen http://localhost:3000
```

## Generating Playwright Storage State for Authenticated Tests

In order to run authenticated end-to-end (E2E) tests without going through the login flow each time, we use **Playwright storage state stringifyed JSON** to persist session cookies and tokens.

### Step-by-Step: Create a Storage State File

1. **Update auth config to match the storage state role**

   In `bciers/apps/dashboard/auth/auth.config.ts`, locate the logic that maps a session to a role, and force set the role when using Playwright.

```
    // 🔒 return encrypted nextauth JWT
    token.app_role = "name_of_role";
    return token;
```

🔐 This ensures when the session from name_of_role.json is loaded, your app treats that user as a name_of_role.

2. **Start your local dev server**

3. **Open Playwright Codegen and Login Manually**

   Run the following command in your terminal:

   ```bash
   cd bciers
   npx playwright codegen http://localhost:3000 --save-storage=name_of_role.json
   ```

   - This will open a Chromium browser with developer tools.
   - Interact with the site as a **name_of_role** user
   - Complete the login flow manually.

4. **Close the Browser Window**

   Once you're fully logged in and the app is loaded, close the Playwright browser window. The session (cookies, tokens) will be saved to a file named:

   ```
   name_of_role.json
   ```

5. **Stringify and add to .env.local**
   Create a STORAGE_STATE key to with JSON string contents of name_of_role.json to .env.local
   Ensure that all "expire" properties are set to -1.

6. **Delete the name_of_role.json file**

> 🛑 **Do not commit this file if it contains sensitive credentials or tokens**

---

### Visual Comparisons

[Happo](https://happo.io/) is a cross browser screenshot testing library used to test for visual regressions. It is integrated with Playwright to capture screenshots of your application and compare them against a baseline to detect any visual changes and will upload the screenshots to the happo servers.

To view and approve Happo diffs, open a pull request with your changes and let the e2e tests run. Once the tests are complete, the Happo report will appear in the list of CI jobs. If there are differences, you can approve or reject them. If you approve them, the new screenshots will be used as the baseline for future tests once merged.

Read more about Happo and how to review diffs here:
[Reviewing Happo Diffs](https://docs.happo.io/docs/reviewing-diffs)

#### Basic setup to take Happo screenshots in your test file

```javascript
import { test } from "@playwright/test";
import happoPlaywright from "happo-playwright";

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});
```

#### Taking a screenshot

Using html selector to take screenshot of entire page. Use something more specific if testing a component.

```javascript
const selector = page.locator("html");

await happoPlaywright.screenshot(page, selector, {
  component: "Page",
  variant: "default",
});
```

If you experience flakiness, you can use the `takeStabilizedScreenshot` function instead. It contains an assertion to wait for the page to stabilize before taking the shot. See https://playwright.dev/docs/api/class-elementhandle#element-handle-wait-for-element-state for more information about the `stable` state.

Additionally, we have two helper functions to stabilize specific page elements, the grids (`stabilizeGrid`) and accordions (`stabilizeAccordion`).

Additionally additionally, sometimes we were unable to get the screenshots to stabilize. In these cases, we only took the screenshots in the browsers that were stable. For example:

```javascript
// 📷 Cheese!
await stabilizeAccordion(page, 4);
await takeStabilizedScreenshot(happoPlaywright, operationsPage.page, {
  component: "Operations Details Page cas_analyst",
  variant: "pending",
  targets: ["chrome"],
});
```

#### Using Happo on your local e2e tests

To view diffs found while running your local e2e tests ask the dev team for access to the Happo dashboard. Add the Happo API key and secret to your .env file. The API key and secret can be found in the Happo dashboard under the Account section.

After you run your e2e tests the screenshots can be viewed in the Happo dashboard as snap requests.

### Best Practices

#### Test Isolation

Ensure that each test is independent and does not rely on the state or outcome of other tests. This helps in maintaining a clean and predictable test suite.

#### Use `expect` Assertions

Use `expect` assertions to verify the expected behavior of the application. Playwright includes async matchers that will wait until the expected condition is met. Consider the following example:

```javascript
await expect(page.getByTestId("status")).toHaveText("Submitted");
```

Playwright will be re-testing the element with the test id of status until the fetched element has the "Submitted" text. It will re-fetch the element and check it over and over, until the condition is met or until the timeout is reached.

### e2e Testing

#### Prerequisites

- To run playwright end-to-end tests for the first time, you may need to run `yarn playwright install ` to install the browsers
  Ensure you have the configuration from file `bciers/bciers/.env.local.example` in `bciers/bciers/.env.local` with values reflecting instructions in file `bciers/bciers/.env.local.example`

  1.0 Ensure the server is running:

For BCIERS app tests the BCIERS apps and run the backend in two terminals:

```bash
cd bci && yarn dev-all
cd bc_obps && make run
```

To run Registration e2e test, just run the `reg` app before running the tests:

```bash
cd bciers && yarn reg
cd bc_obps && make run
```

2.0 Run the tests:

Run tests from new terminal command:
Run tests in the background using terminal command `yarn <app shortform>:e2e:ci`. These commands are located in `package.json`:

```bash
cd bciers && yarn reg:e2e
```

Run tests with the Playwright GUI using terminal command:

```bash
cd bciers && yarn reg:e2e:ui
```

pre-commit run --all-files

### Debugging Playwright

**HTML report**
The HTML report shows you a report of all your tests that have been ran and on which browsers as well as how long they took. Tests can be filtered by passed tests, failed, flakey or skipped tests. You can also search for a particular test. Clicking on a test will open the detailed view where you can see more information on your tests such as the errors, the test steps and the trace.

For debugging CI, you can download the HTML report artifact found in `GitHub\Actions\Test Registration App\Artifacts\ playwright-report` and extract the files to `bciers/playwright-report`. To view the downloaded the HTML report artifact locally run terminal command:

```bash
cd bciers && yarn reg:e2e:report

```

#### Debugging Playwright in CI

[Debugging CI Playwright documentation](https://playwright.dev/docs/ci-intro#downloading-the-html-report)

If you are running into issues with your tests in CI, you can uncomment the Playwright html report upload steps in our GitHub Actions e2e workflow files. This will allow you to download the HTML report artifact from the CI job and view it locally if more context is needed than what is displayed in the failed job.

These commented jobs are located in the `bciers/.github/workflows` directory in `test-nx-project-e2e.yaml`.

#### Traces

Traces are normally run in a Continuous Integration(CI) environment, because locally you can use UI Mode for developing and debugging tests. However, if you want to run traces locally without using UI Mode, you can force tracing to be on with --trace on.

```bash
npx playwright test --trace on
```

**Opening the trace**
In the HTML report click on the trace icon next to the test name file name.

### Accessibility testing with Playwright and Axe

[Playwright accessiblity testing documentation](https://playwright.dev/docs/accessibility-testing)

Accessibility is important. To test a page for accessibility issues import the `analyzeAccessibility` helper function in a playwright e2e test and pass it the page object:

```javascript
import { analyzeAccessibility, setupTestEnvironment } from "@/e2e/utils/helpers";

...

// ♿️ Analyze accessibility
await analyzeAccessibility(page);

```

If this step fails the library will provide details about why it failed and how to fix it.

## Testing Strategy

### Registration

We have good vitest and pytest coverage (integration tests), so we've taken a minimalistic approach to e2e tests in Registration. We've also prioritized readability over abstraction, so there is some repetition in the tests, but this makes it easier to find failures (vs. trying to find the relevant value of a variable in a loop).

We load the db with our mock data before running tests.

We test:

- creating and registering a new SFO with a New Entrant purpose and a new operation rep
- registering an existing LFO with Opt-In purpose and a new facility
- accessibility on every form. Where the SFO/LFO form is the same, we analyze only in the SFO test

This covers 2/3 registration types (SFO/LFO), 2/6 purposes, and all of the form steps. We only fill in required fields, we only test as industry_user role, and we only test editable mode (not view).
