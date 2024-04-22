# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Testing

### Unit Tests with Vitest

```bash
cd client && yarn test
```

If you want to see `console.log` or more detail, add the `--verbose` flag.

If you want to see more HTML output, add `DEBUG_PRINT_LIMIT=1000000` (or any large number).

If you want to access the testing playground, add `screen.logTestingPlaygroundURL()` to your test (although if the URL is too long, the playground will be blank).

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

#### Writing Unit Tests

React Testing Library isn't entirely compatible with Next 13 yet, so a few things to note:

- If you're testing a simple async component, you can use `render(await Operations());` instead of `render(<Operations />)`. If the component is more complicated (e.g., it imports other async components, or a mix of client/server), it appears there isn't yet a solution: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612

- To mock fetching data which uses our `actionHandler` you can import the action handler mock and mock the response values using `mockReturnValue` or `mockReturnValueOnce`:

```
import { actionHandler } from "@/tests/setup/mocks";

actionHandler.mockReturnValueOnce({
  ...mocked response data
});
```

### Backend unit tests (for API endpoints) with Pytest

#### Running Tests

The easiest way to run these tests locally is by using commands from the Makefile.

```shell
> make pythontests              # standard pytest run
> make pythontests_verbose      # run pytest with verbose output (helpful for troubleshooting unit tests)
> make pythontests_watch        # adds a watcher that can run pytest in the background; unit tests will re-run whenever changes to a Python file are detected
> make pythontests_coverage     # run pytest with coverage report
> make pythontests ARGS='registration/tests/<file_name.py>' # run pytest for a specific file
> make pythontests ARGS='-k <TestClassname>' # run pytest for a specific class, e.g. make pythontests ARGS='-k TestNaicsCodeEndpoint'
> make pythontests ARGS='-k <test_name>' # run pytest for a specific test, e.g. make pythontests ARGS='-k test_get_method_for_200_status' (note: if any tests have the same name, even if they're within different classes, this command will run them all)
```

#### Testing Helpers

We have some testing helpers in tests.utils.helpers.TestUtils:

- mock user roles for get, post, and put requests
- mock postal codes
- authorize a user as belonging to an operator
- create mock operations

To use the helpers, import them from `utils` and use like this:

```
TestUtils.mock_postal_code()
```

### End-to-end Tests with Playwright

### Introduction

Playwright is a powerful end-to-end testing library for web applications. It provides a simple API to automate browser actions, allowing developers to create robust and maintainable tests.

### Getting Started

To get started with Playwright, you'll need to install it as a dependency in your project:

```bash
yarn install @playwright/test
```

2.0 Ensure the client app is running:

### Writing Tests

#### Basic Test Structure

Playwright tests follow a simple structure. Each test case is a JavaScript or TypeScript function with Playwright APIs for interacting with the browser.

```javascript
const { test } = require("@playwright/test");
test("Example Test", async ({ page }) => {
  // Your test logic goes here
});
```

#### Locators

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
cd client && npx playwright codegen http://localhost:3000
```

### Authenticated State

Playwright executes tests in isolated environments called browser contexts. This isolation model improves reproducibility and prevents cascading test failures. Tests can load existing authenticated state. This eliminates the need to authenticate in every test and speeds up test execution.

Our strategy for createing and loading authenticated states of the app's user by role is documented [here](https://github.com/bcgov/cas-registration/issues/1101).

### Visual Comparisons

[Happo](https://happo.io/) is a cross browser screenshot testing library used to test for visual regressions. It is integrated with Playwright to capture screenshots of your application and compare them against a baseline to detect any visual changes and will upload the screenshots to the happo servers.

To view and approve Happo diffs, open a pull request with your changes and let the e2e tests run. Once the tests are complete, the Happo report will appear in the list of CI jobs. If there are differences, you can approve or reject them. If you approve them, the new screenshots will be used as the baseline for future tests once merged.

Read more about Happo and how to review diffs here:
[Reviewing Happo Diffs](https://docs.happo.io/docs/reviewing-diffs)

#### Basic setup to take Happo screenshots in your test file

```
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

```
const selector = page.locator("html");

await happoPlaywright.screenshot(page, selector, {
  component: "Page",
  variant: "default",
});
```

#### Using Happo on your local e2e tests

To view diffs found while running your local e2e tests ask the dev team for access to the Happo dashboard. Add the Happo API key and secret to your .env file. The API key and secret can be found in the Happo dashboard under the Account section.

````

After you run your e2e tests the screenshots can be viewed in the Happo dashboard as snap requests.

### Best Practices

#### Test Isolation

Ensure that each test is independent and does not rely on the state or outcome of other tests. This helps in maintaining a clean and predictable test suite.

#### Use `expect` Assertions

Use `expect` assertions to verify the expected behavior of the application. Playwright includes async matchers that will wait until the expected condition is met. Consider the following example:

```javascript
await expect(page.getByTestId("status")).toHaveText("Submitted");
````

Playwright will be re-testing the element with the test id of status until the fetched element has the "Submitted" text. It will re-fetch the element and check it over and over, until the condition is met or until the timeout is reached.

### e2e Testing

#### Prerequisites

- To run playwright end-to-end tests for the first time, you may need to run `yarn playwright install --with-deps` to install the browsers
  Ensure you have the configuration from file `client/e2e/.env.local.example` in `client/e2e/.env.local` with values reflecting instructions in file `client/e2e/.env.local.example`

  1.0 Ensure the server is running:

Start server from new terminal command:

```bash
cd client && yarn dev
cd bc_obps && make run
```

2.1 Or, to simulate how the application will behave in a production environment locally, start client app from new terminal command:

```bash
cd client && yarn build && yarn start
```

Note: you can uncomment the `webServer` array in `playwright.config.ts` to run the tests without running client and server separately.

3.0 Run the tests:

Run tests from new terminal command:

```bash
cd client && yarn e2e
```

Run tests with the Playwright GUI using terminal command:

```bash
cd client && yarn e2e:ui
```

pre-commit run --all-files

### Debugging Playwright

**HTML report**
The HTML report shows you a report of all your tests that have been ran and on which browsers as well as how long they took. Tests can be filtered by passed tests, failed, flakey or skipped tests. You can also search for a particular test. Clicking on a test will open the detailed view where you can see more information on your tests such as the errors, the test steps and the trace.

For debugging CI, you can download the HTML report artifact found in `GitHub\Actions\Test Registration App\Artifacts\ playwright-report` and extract the files to `client/playwright-report`. To view the downloaded the HTML report artifact locally run terminal command:

```bash
cd client && yarn playwright show-report

```

[Debugging CI Playwright documentation](https://playwright.dev/docs/ci-intro#downloading-the-html-report).

**Traces**
Traces are normally run in a Continuous Integration(CI) environment, because locally you can use UI Mode for developing and debugging tests. However, if you want to run traces locally without using UI Mode, you can force tracing to be on with --trace on.

```
npx playwright test --trace on
```

**Opening the trace**
In the HTML report click on the trace icon next to the test name file name to directly open the trace for the required test, or run command:

```bash
cd client &&  npx playwright show-trace test-results/setup-trace.zip
```

### Accessibility testing with Playwright and Axe

[Playwright accessiblity testing documentation](https://playwright.dev/docs/accessibility-testing)

Accessiblity is important. To test a page for accessibility issues import the `analyzeAccessibility` helper function in a playwright e2e test and pass it the page object:

```
import { analyzeAccessibility, setupTestEnvironment } from "@/e2e/utils/helpers";

...

// ♿️ Analyze accessibility
await analyzeAccessibility(page);

```

If this step fails the library will provide details about why it failed and how to fix it.

### Debugging Django using Shell Plus

[Shell Plus](https://django-extensions.readthedocs.io/en/latest/shell_plus.html) is a Django extension that allows you to run a shell with all of your Django models and settings pre-loaded. This is useful for debugging and testing.
You can run Shell Plus with the following command:

```bash
> python manage.py shell_plus
```
