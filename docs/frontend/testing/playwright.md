# Playwright Testing Guidelines

## Introduction

Playwright is our end-to-end testing framework for validating user workflows across the BCIERS applications. These tests should behave like a real user as much as possible: navigate through the UI, use accessible locators, wait for visible user-facing states, and avoid depending on implementation details.

The goal of this guide is to help us write tests that are:

- reliable in CI
- easy to debug locally
- readable during PR review
- resistant to flakiness caused by timing, HMR, animations, network latency, or app re-renders

## Getting Started

Ensure you have the correct env variables set up in the `bciers/.env.local` file. You can copy the `.env.local.example` file and update the values accordingly.

Install Playwright browsers the first time you run e2e tests locally:

```bash
cd bciers
yarn playwright install
```

Run the backend and frontend apps before running the tests:

```bash
cd bc_obps
make run
```

```bash
cd bciers
yarn dev-all
```

For Registration-only tests, you can run only the Registration app:

```bash
cd bciers
yarn reg
```

## Test organization in our monorepo

The e2e tests are organized in separate projects in the `/bciers/apps` directory. Each project has its own e2e app directory, for example:

```txt
bciers/apps/registration-e2e
bciers/apps/reporting-e2e
bciers/apps/compliance-e2e
```

To run most BCIERS app tests, the Dashboard app must also be running because of our authentication implementation. Shared utilities live in:

```txt
bciers/libs/e2e
```

Use shared helpers and page object models when they improve consistency, but avoid over-abstracting simple test steps. A readable test failure is usually better than a very generic helper that hides what the test is doing.

## Writing Tests

### Basic Test Structure

```typescript
import { expect, test } from "@playwright/test";

test("example test", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
});
```

### Locators

#### Prefer user-facing locators

Use locators that match what a user can perceive: roles, names, labels, placeholders, and text. These are more stable than CSS selectors because they are tied to the user experience instead of DOM structure.

```typescript
// Good
await page.getByRole("button", { name: /continue/i }).click();
await page.getByLabel(/operation name/i).fill("Test Operation");
await page.getByRole("heading", { name: /review report/i }).waitFor();

// Acceptable when there is no accessible user-facing locator
await page.getByTestId("report-status").click();

// Avoid
await page.locator(".MuiButton-root").click();
await page.locator("//div[@class='my-button']").click();
```

#### Use scoped locators for repeated UI

When a page has repeated buttons, rows, or cards, first locate the parent, then locate the action inside that parent.

```typescript
const row = page.getByRole("row").filter({ hasText: "Facility 1" }).first();

await expect(row).toBeVisible();

await row.getByRole("button", { name: /view details/i }).click();
```

This prevents accidentally clicking the first matching button elsewhere on the page.

#### Code Generation

To find locators, use Playwright codegen:

```bash
cd bciers
npx playwright codegen http://localhost:3000
```

Use generated locators as a starting point, then clean them up to prefer accessible roles and stable names.

## Best Patterns to Prevent Flaky Tests

### 1. Avoid hard waits

Do not use `waitForTimeout()` as a stability fix. It makes tests slower and still fails when CI is slower than expected.

```typescript
// Avoid
await page.waitForTimeout(3000);

// Prefer a user-visible readiness assertion
await expect(
  page.getByRole("heading", { name: /final review/i }),
).toBeVisible();
```

### 2. Wait for the result of an action, not just the action

A click only proves that Playwright dispatched the click. It does not prove that the app finished saving, navigating, rendering, or loading data.

```typescript
await page.getByRole("button", { name: /continue/i }).click();

await expect(
  page.getByRole("heading", { name: /review facilities/i }),
).toBeVisible();
```

### 3. Pair navigation waits with clicks

When a click is expected to navigate, start the URL wait before the click. This avoids a race where the navigation happens before the test starts waiting.

```typescript
await Promise.all([
  page.waitForURL(/\/reports\/\d+\/review-facility-information/, {
    waitUntil: "domcontentloaded",
  }),
  page.getByRole("button", { name: /continue/i }).click(),
]);
```

If the click does not always navigate, do not use `waitForURL`. Assert the actual expected UI state instead.

```typescript
await page.getByRole("button", { name: /save/i }).click();

await expect(page.getByText(/saved successfully/i)).toBeVisible();
```

### 4. Prefer Playwright auto-waiting assertions

Playwright assertions retry until the condition passes or the timeout is reached.

```typescript
await expect(page.getByTestId("status")).toHaveText("Submitted");
await expect(page.getByRole("button", { name: /submit/i })).toBeEnabled();
await expect(page.getByRole("progressbar")).toBeHidden();
```

Avoid manually checking state immediately after an action:

```typescript
// Avoid
expect(await page.getByTestId("status").textContent()).toBe("Submitted");
```

### 5. Wait for page-ready signals

Use a clear signal that the page is actually ready before interacting with it. Good readiness signals include:

- heading is visible
- expected tab is selected
- grid has loaded at least one expected row
- loading spinner is hidden
- submit button is enabled
- URL matches the expected route

```typescript
await expect(
  page.getByRole("heading", { name: /current reports/i }),
).toBeVisible();
await expect(page.getByRole("progressbar")).toBeHidden();
await expect(page.getByRole("button", { name: /start report/i })).toBeEnabled();
```

### 6. Avoid brittle URL-only assertions

URL assertions are useful, but they should not be the only proof that the page is ready. A route can change before the page data has finished loading.

```typescript
await expect(page).toHaveURL(/\/reports\/\d+\/final-review/);
await expect(
  page.getByRole("heading", { name: /final review/i }),
).toBeVisible();
```

### 7. Use `expect.toPass()` for retrying a whole interaction block

Use `expect.toPass()` when the page may re-render during HMR, loading, or transient state changes. This is useful for interaction blocks where retrying just one assertion is not enough.

```typescript
await expect(async () => {
  const row = page.getByRole("row").filter({ hasText: "Facility 1" }).first();

  await expect(row).toBeVisible();
  await expect(
    row.getByRole("button", { name: /view details/i }),
  ).toBeEnabled();

  await row.getByRole("button", { name: /view details/i }).click();
}).toPass();
```

Use this intentionally. Do not wrap the entire test in `toPass()`.

### 8. Check buttons are visible and enabled before clicking

This gives cleaner failure messages and avoids clicking during disabled/loading states.

```typescript
const button = page.getByRole("button", { name: /continue/i });

await expect(button).toBeVisible();
await expect(button).toBeEnabled();

await button.click();
```

### 9. Avoid `force: true` unless there is a strong reason

`force: true` bypasses Playwright actionability checks. It can hide real UX bugs where a user would not actually be able to click the element.

```typescript
// Avoid unless intentionally testing a hidden/covered control
await button.click({ force: true });
```

### 10. Keep tests isolated

Each test should set up or select its own data and should not depend on the outcome of a previous test. A test should pass when run:

- alone
- with the full suite
- in a different order
- on retry

Avoid shared mutable state between tests unless it is reset by fixtures or database setup.

### 11. Prefer deterministic test data

Use predictable test data that will not collide with other tests or previous local runs.

```typescript
const operationName = `E2E Operation ${test.info().workerIndex}`;
```

When possible, use seeded fixtures or dedicated e2e setup helpers instead of relying on whatever data exists locally.

### 12. Be careful with network waits

Waiting for a network response can be useful, but do not make tests too tightly coupled to implementation details. Prefer UI assertions unless the test specifically needs to verify an API-driven side effect.

```typescript
const saveResponse = page.waitForResponse(
  (response) =>
    response.url().includes("/api/reporting") &&
    response.request().method() === "POST" &&
    response.ok(),
);

await page.getByRole("button", { name: /save/i }).click();
await saveResponse;

await expect(page.getByText(/saved successfully/i)).toBeVisible();
```

### 13. Stabilize screenshots before visual comparison

For Happo screenshots, wait for the page or component to stabilize before taking a screenshot. Use the shared helpers where available:

- `takeStabilizedScreenshot`
- `stabilizeGrid`
- `stabilizeAccordion`

```typescript
await stabilizeGrid(page);
await takeStabilizedScreenshot(happoPlaywright, page, {
  component: "Current Reports Grid",
  variant: "industry_user",
  targets: ["chrome"],
});
```

### 14. Prefer helper methods with explicit expectations

Page object methods should include the readiness and actionability checks needed for the action to be reliable.

```typescript
async clickContinue(): Promise<void> {
  const button = this.page.getByRole("button", { name: /continue/i });

  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();

  await Promise.all([
    this.page.waitForURL(/expected-next-route/, { waitUntil: "domcontentloaded" }),
    button.click(),
  ]);
}
```

If the route is conditional, pass the expected URL into the helper or assert a stable UI state instead.

## Running E2E Tests Locally

### Prerequisites

Start the backend:

```bash
cd bc_obps
make run
```

Start the frontend apps:

```bash
cd bciers
yarn dev-all
```

For Registration-only testing:

```bash
cd bciers
yarn reg
```

### Run an app's e2e suite

```bash
cd bciers
yarn reg:e2e
```

```bash
cd bciers
yarn report:e2e
```

```bash
cd bciers
yarn compliance:e2e
```

### Run with Playwright UI mode

```bash
cd bciers
yarn reg:e2e:ui
```

```bash
cd bciers
yarn report:e2e:ui
```

UI mode is best for writing and debugging tests interactively.

### Run E2E like CI locally

Use `CI=true` to more closely match the CI environment. This is useful when a test passes in UI mode but fails in CI.

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e
```

Run a specific Reporting test like CI:

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium
```

Run headed while still using CI-like settings:

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium --headed
```

## Running Tests With Trace

Traces are the best way to debug CI-style failures because they show:

- each Playwright action
- screenshots before and after actions
- DOM snapshots
- console logs
- network requests
- locator resolution
- actionability checks

### Run a specific test with trace

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium --headed --trace on
```

### Run a specific test with trace only on failure

This is usually the best default when debugging a flaky test:

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium --headed --trace retain-on-failure
```

### Run trace on first retry

Useful when the test usually passes but fails occasionally:

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium --trace on-first-retry
```

### Find trace files

Trace files may be written under the app-specific e2e output folder, not always root `dist`.

```bash
cd bciers
find . -type f -name "trace.zip"
```

For Reporting specifically:

```bash
cd bciers
find apps/reporting-e2e -type f -name "trace.zip"
```

Example Reporting trace path:

```txt
apps/reporting-e2e/dist/.playwright/test-output/workflows-LFO-submit-repor-d8122-nd-submits-a-new-LFO-report-chromium/trace.zip
```

### Open a trace

```bash
cd bciers
yarn playwright show-trace apps/reporting-e2e/dist/.playwright/test-output/workflows-LFO-submit-repor-d8122-nd-submits-a-new-LFO-report-chromium/trace.zip
```

Open a retry trace:

```bash
cd bciers
yarn playwright show-trace apps/reporting-e2e/dist/.playwright/test-output/workflows-LFO-submit-repor-d8122-nd-submits-a-new-LFO-report-chromium-retry1/trace.zip
```

### Common trace troubleshooting checklist

When reviewing a trace, check:

1. Did the click happen?
2. Was the target element visible and enabled?
3. Was the element covered by a snackbar, loading overlay, sticky header, or modal?
4. Did the expected request fire?
5. Did the request return a success status?
6. Did the URL change to what the test expected?
7. Did the UI render the expected next page?
8. Did the test wait for a URL when no navigation actually happened?
9. Did HMR or React re-render remove the element during the action?
10. Did the test timeout because an earlier wait never resolved?

For failures like:

```txt
Error: page.waitForURL: Test ended.
waiting for navigation until "domcontentloaded"
```

Check whether the click actually triggers navigation. If it only saves data or updates state, remove the `waitForURL` and assert a visible UI state instead.

## UI Mode (Local Development)

When running Playwright in UI mode:

```bash
yarn <app>:e2e:ui
```

We allow HMR / Fast Refresh from Next.js during local development.

### Why

- faster iteration while writing or debugging tests
- immediate feedback when editing tests or POMs
- useful for interactive debugging

### Trade-offs

- HMR can trigger React re-mounts
- elements may briefly disappear and reappear
- transient DOM states can expose timing issues

To mitigate this, tests should:

- use Playwright assertions that auto-retry
- wait for clear page-ready signals
- prefer stable user-facing locators
- retry small interaction blocks with `expect.toPass()` when appropriate
- avoid disabling HMR unless explicitly validating production-like behavior

HMR logs such as these are expected in UI mode and do not indicate test failure:

```txt
[HMR] connected
[Fast Refresh] rebuilding
```

## Debugging Playwright

### HTML report

The HTML report shows test results by browser, duration, retries, failure details, screenshots, videos, and traces.

Open the local report:

```bash
cd bciers
yarn playwright show-report
```

For a specific app report path, search for reports:

```bash
cd bciers
find . -type d -name "playwright-report"
```

Then open the relevant one:

```bash
yarn playwright show-report path/to/playwright-report
```

For debugging CI, download the HTML report artifact from GitHub Actions, extract it locally, and open it with:

```bash
cd bciers
yarn playwright show-report playwright-report
```

### Debugging Playwright in CI

If tests fail in CI and the job output is not enough, enable or uncomment the HTML report upload steps in the GitHub Actions e2e workflow files.

These are located in:

```txt
bciers/.github/workflows/test-nx-project-e2e.yaml
```

## Generating Playwright Storage State for Authenticated Tests

In order to run authenticated e2e tests without going through the login flow each time, we use Playwright storage state stringified JSON to persist session cookies and tokens.

### Step-by-step: Create a Storage State File

1. **Update auth config to set `token.app_role` as the storage state role**

   In `bciers/apps/dashboard/auth/auth.config.ts`, temporarily force the token's app role for use with Playwright:

   ```typescript
   token.app_role = "name_of_role";
   return token;
   ```

2. **Update auth config to set `maxAge` as far future expiry**

   In `bciers/apps/dashboard/auth/index.ts`, temporarily force the token expiration time:

   ```typescript
   maxAge: 60 * 60 * 24 * 365 * 100, // 100 years
   ```

3. **Start your local dev servers**

   ```bash
   cd bc_obps
   make run
   ```

   ```bash
   cd bciers
   yarn dev-all
   ```

4. **Open Playwright codegen and login manually**

   ```bash
   cd bciers
   npx playwright codegen http://localhost:3000 --save-storage=name_of_role.json
   ```

5. **Close the browser window**

   Once fully logged in, close the Playwright browser window. The session will be saved to:

   ```txt
   name_of_role.json
   ```

6. **Revert the temporary auth config changes**

   Revert changes in:

   ```txt
   bciers/apps/dashboard/auth/auth.config.ts
   bciers/apps/dashboard/auth/index.ts
   ```

7. **Stringify and add to `.env.local`**

   Create an env key like:

   ```txt
   E2E_NAME_OF_ROLE_STORAGE_STATE=
   ```

   Paste the stringified JSON contents of `name_of_role.json`.

   Ensure all `expires` properties are set to `-1`.

8. **Add as a GitHub secret**

   In GitHub, go to:

   ```txt
   Settings → Secrets and variables → Actions → New repository secret
   ```

   Add:

   ```txt
   Name: E2E_NAME_OF_ROLE_STORAGE_STATE
   Value: full stringified contents
   ```

9. **Reference the secret in the GitHub Actions workflow**

   In `.github/workflows/test-nx-project-e2e.yaml`, add:

   ```yaml
   E2E_NAME_OF_ROLE_STORAGE_STATE: ${{ secrets.E2E_NAME_OF_ROLE_STORAGE_STATE }}
   ```

10. **Delete the local storage state file**

    Do not commit storage state files containing credentials, cookies, or tokens.

## Visual Comparisons

[Happo](https://happo.io/) is a cross-browser screenshot testing library used to test for visual regressions. It is integrated with Playwright to capture screenshots of the application and compare them against a baseline.

To view and approve Happo diffs, open a pull request with your changes and let the e2e tests run. Once the tests are complete, the Happo report appears in the CI job list. If there are differences, approve or reject them in Happo.

Read more:

[Reviewing Happo Diffs](https://docs.happo.io/docs/reviewing-diffs)

### Basic setup to take Happo screenshots

```typescript
import { test } from "@playwright/test";
import happoPlaywright from "happo-playwright";

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});
```

### Taking a screenshot

Use a specific selector when testing a component. Use `html` only when intentionally testing the whole page.

```typescript
const selector = page.locator("html");

await happoPlaywright.screenshot(page, selector, {
  component: "Page",
  variant: "default",
});
```

If screenshots are flaky, prefer `takeStabilizedScreenshot` and the shared stabilization helpers:

```typescript
await stabilizeAccordion(page, 4);

await takeStabilizedScreenshot(happoPlaywright, page, {
  component: "Operations Details Page cas_analyst",
  variant: "pending",
  targets: ["chrome"],
});
```

### Using Happo locally

Ask the dev team for access to the Happo dashboard. Add the Happo API key and secret to your `.env` file. After running e2e tests locally, screenshots can be viewed in the Happo dashboard as snap requests.

## Accessibility testing with Playwright and Axe

Accessibility is important. To test a page for accessibility issues, import the `analyzeAccessibility` helper and pass it the page object.

```typescript
import { analyzeAccessibility } from "@/e2e/utils/helpers";

await analyzeAccessibility(page);
```

If this step fails, the accessibility library provides details about the issue and how to fix it.

## Testing Strategy

### Registration

Registration has strong Vitest and pytest coverage, so the Registration e2e suite intentionally stays minimal. The e2e tests focus on the highest-value user workflows.

We prioritize readability over abstraction. Some repetition is acceptable when it makes failures easier to understand.

We load the database with mock data before running tests.

Current Registration coverage includes:

- creating and registering a new SFO with a New Entrant purpose and a new operation representative
- registering an existing LFO with an Opt-In purpose and a new facility
- accessibility checks on every form
- SFO/LFO shared form accessibility covered once where the form is the same

This covers:

- 2 of 3 registration types: SFO and LFO
- 2 of 6 purposes
- all required form steps
- `industry_user` role
- editable mode only

## Quick Reference Commands

### Run Reporting e2e like CI

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e
```

### Run one Reporting test file headed with trace

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium --headed --trace on
```

### Find Reporting traces

```bash
cd bciers
find apps/reporting-e2e -type f -name "trace.zip"
```

### Open a Reporting trace

```bash
cd bciers
yarn playwright show-trace apps/reporting-e2e/dist/.playwright/test-output/<trace-folder>/trace.zip
```

### Run one test by title

```bash
cd bciers
BASE_URL=http://localhost:5000 CI=true yarn report:e2e -- tests/workflows/LFO/submit-report.spec.ts --project=chromium -g "Industry user starts, fills, and submits a new LFO report"
```
