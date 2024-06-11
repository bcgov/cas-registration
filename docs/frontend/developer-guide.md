# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Next.js 14

**TLDR**

Architectural design using Next.js 14 includes employing a hierarchical structure of React server components as much as possible to enhance page loading and performance. Nested client pages are utilized whenever user interactions or event handling are required. An improved user experience is achieved through the use of layout.tsx, loading.tsx, and error.tsx components, in conjunction with Suspense components that enable the display of a fallback while asynchronous content is being loaded. The data-fetching pattern involves server actions for server side fetching security, for centralizing data access management, and for reduced API route definitions.

Next.js 14 foundation is the App Router which boasts a range of features, including:

[Routing](https://nextjs.org/docs/app/building-your-application/routing)
Creating routes involves creating folders within the app directory and nesting a page.tsx file within the appropriate folder to define your route. Note: our `withAuthorization` middleware removes the first three folders (e.g. authenticated/bceidbudiness/industry_user) from the route, so all the URLs within the app will start with `dashboard` instead of `authenticated/.../dashboard`.

[Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
By default, all app router components are react server components and if you want to write a client component you need to mark them explicitly using the "use client"; directive.
We use server components, which render on the server, as much as possible to accelerate page load times as different page contents are loaded in small chunks and independently.
We use client components when ever we need user interactions or event handling such as click events and React hooks (useState, useRef).
This means Next.js can have a component hierarchy to combine server and client components.

[Layout Component](https://nextjs.org/docs/app/api-reference/file-conventions/layout)
A layout component is a versatile UI element that shapes a page's structure. It can include components like headers, footers, and sidebars, and even offer shared functions like navigation. This component is designed to receive a children prop and wrap all page files in the same directory with it.
Layout components work with routing, enabling smooth transitions between app pages. Since the layout component remains active when routes change, its state is retained, ensuring consistent and reusable layouts with minimal effort.

Nested Layouts
These are layouts defined inside folders and apply to specific route segments and render when those segments are active. It allows you to define multiple levels of layout components, each enclosing the content of its child components.

[Loading Component](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
This component can be made in any app folder directory. It auto-wraps pages with a React suspense boundary (that is, a component that helps manage loading moments when components need to fetch data or resources asynchronously). It shows on the first load and during sibling route navigation.

[Error Component](https://nextjs.org/docs/app/api-reference/file-conventions/error)
This client side component confines errors to the app's tiniest section. Making an error file auto-encloses the page with a React error boundary. Any error within this file's folder swaps the component with its contents.

[Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
This involves sending parts of a webpage progressively from the server to the user's device. Unlike the traditional Server-Side Rendering (SSR), where all the data must be fetched before rendering, RSC streaming sends smaller chunks of HTML as they're ready.
It's works by using the <Suspense> and loading text or component, improving loading and user experience, especially on slower devices.

[Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
Route Groups organize routes in the app directory without altering URL paths. Enclosing a folder name in parentheses creates a Route Group that keeps related routes together. This allows for logical grouping, nested layouts, and a clean URL structure.

[Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
Next.js extends the native fetch Web API to allow you to configure the caching and revalidating behavior for each fetch request on the server. React extends fetch to automatically memoize fetch requests while rendering a React component tree.

You can use fetch with:

- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server Actions](https://nextjs.org/docs/app/api-reference/functions/server-actions)

With Server Actions, you don't need to manually create API endpoints. Instead, you define asynchronous server functions that can be called directly from Server Components or from Client Components and forms.
**Note**: Defining, or importing, a server action in a (parent) Server Component allows the (child) form `action` to function without JavaScript, providing progressive enhancement.

A single `actionHandler()` function has been created in `utils/actions` to handle all requests to the backend at a single point. This action handler takes:

- A backend endpoint
- A method (GET,PUT,POST,DELETE,PATCH)
- The path to revalidate (where was it called from on the frontend)
- An optional options object (for example, the body of a POST request goes in this object)

### NextAuth with Keycloak

NextAuth.js is a library specifically designed to handle authentication solutions in Next.js apps, see [NextAuth.js repo](https://github.com/nextauthjs/next-auth) to learn more.
NextAuth.js has a concept of providers, which define the services that can be used to sign in, in this app the provider is keycloak.

Before getting started, make sure you have a working Keycloak instance with the required configurations:

- auth-server-url
- realm
- resource
- credentials\secrets

Client/app/api/auth/[...nextauth] defines the options object for the keycloak authentication provider, session settings, JWT settings, and callbacks for sign-in, redirect, and session management. For configuration values, see [1Password](https://climateactionsecretariat.1password.ca/) documents: `OBPS FE env.local` and `OBPS FE env`

**Next.js says:**

```
Good to know: .env, .env.development, and .env.production files should be included in your repository as they define defaults. .env*.local is where secrets can be stored and should be added to .gitignore.
```

Once the NextAuth options object is configured, calls to NextAuth route `/api/auth/signin/keycloak`, triggered from `next-auth/react: signIn("keycloak")`, will direct user to the keycloak sign in form. Successful IDIR login will redirect to callback defined in NEXTAUTH_URL. Failed IDIR login will redirect to callback NEXTAUTH_URL error page (client/app/auth/error/page.tsx).

Since next-auth creates its own token, it doesn't automatically give you access to the original information from the IDIR keycloak provider.
However, the NextAuth options object provides callback functions that allow propagation of information from provider JWT to NextAuth JWT. Case in point, the keycloak JWT id_token is applied to the NextAuth JWT in JWT calback within `client/app/api/auth/[...nextauth]/route.ts` to enable federated, single sign out, through custom api route `/api/auth/logout` before ending the NextAuth session through NextAuth route `/api/auth/signout`, triggered from `next-auth/react: signOut()`.

### middleware

Next.js [Middleware ](https://nextjs.org/docs/advanced-features/middleware) allows control over requests before they are completed. Responses can be modified based on conditions such as authentication session or language detection along with implementing persistence via cookie.
Client\middleware implements middleware to secured the app routes based on NextAuth authentication JWT from the IDIR keycloak provider.

## Styling

[CSS theme guide](/docs/css-theme-guide.md)

### MUI v5

[Material-UI (MUI)](https://mui.com/material-ui/getting-started/) is a popular open-source UI framework for React applications that is based on Google's Material Design guidelines. It provides a wide range of reusable and customizable components and styles to help you build modern, attractive, and responsive web applications

Material-UI has been configured for Next.js app router using a theme registry component (/cas-registration/client/app/components/theme/ThemeRegistry.tsx) as a provider to the children within the root layout (/cas-registration/client/app/layout.tsx) and providing config option in client/next.config.js.

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a popular utility-first CSS framework that is designed to simplify and streamline the process of building modern, responsive web interfaces. It focuses on providing a set of highly reusable utility classes that you can apply directly to your HTML elements to style and structure.

Tailwind has been configured to work with MUI within client/tailwind.config.js as per [intergration documentation](https://mui.com/material-ui/guides/interoperability/#tailwind-css)

You can use Tailwind CSS classes to style Material-UI components by applying the classes directly to the Material-UI components in your JSX.

```
import { Button, Paper } from '@mui/material';

function MyComponent() {
  return (
    <Paper className="p-4">
      <Button className="bg-blue-500 hover:bg-blue-700 text-white">Click Me</Button>
    </Paper>
  );
}
```

**Optional:** It is best practice while using Tailwind and MUI together to add a prefix in the tailwind class and by setting tailwind to important so that class conflicts are reduced between these two libraries.

```js
// tailwind.config.js
module.exports = {
  prefix: 'tw-',   👈 Use your desired prefix
}
```

## Testing

### Unit Tests with Vitest

```bash
cd client && yarn test
```

If you want to see `console.log` or more detail, add the `--verbose` flag.

If you want to see more HTML output, add `DEBUG_PRINT_LIMIT=1000000` (or any large number).

If you want to access the testing playground, add `screen.logTestingPlaygroundURL()` to your test (although if the URL is too long, the playground will be blank).

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

#### Test Coverage

[Vitest coverage documentation](https://vitest.dev/guide/coverage)

To generate a test coverage report, run the following command:

```bash
cd bciers && yarn reg:coverage
```

#### Writing Unit Tests

React Testing Library isn't entirely compatible with Next server components yet, so a few things to note:

- If you're testing a client component, put the component in <>, e.g. `render(<Operations />)`
- If you're testing a server component, await the component as a function, e.g. `render(await Operations());`
- If the you're testing a server component that imports another server component (e.g. `OperationsPage`), when you run the test you'll see an error about rendering React children. This is a [limitation of server components with react testing library](https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612). As a workaround until this is fixed, you can mock the child server components, e.g.

```
vi.mock("apps/registration/app/components/operations/Operations", () => {
  return {
    default: () => <div>mocked Operations component</div>,
  };
});
```

- To mock fetching data which uses our `actionHandler` you can import the action handler mock and mock the response values using `mockReturnValue` or `mockReturnValueOnce`:

```javascript
import { actionHandler } from "@/tests/setup/mocks";

actionHandler.mockReturnValueOnce({
  ...mocked response data
});
```

To maintain test isolation, we should clear or reset (note that clearing and resetting are [different](https://vitest.dev/api/mock.html#mockreset)) mocks before every test:

```javascript
beforeEach(() => {
  vi.resetAllMocks(); // most agressive, clears all calls and resets implementations (any mocked function will return undefined after this)
  vi.clearAllMocks(); // less agressive, clears calls but does not reset implementations
});
```

We have some global mocks set up, so even if you haven't written any mocking code, it's useful to add a `beforeEach` to clean the slate before every test.

### End-to-end Tests with Playwright

#### Run Playwright Specs

Certainly! Below is a simple template for documentation on writing Playwright tests, including best practices and tips. Feel free to customize it based on your specific needs:

## 1.0 Ensure the server is running:

Start server from new terminal command:

# Playwright Testing Documentation

## Introduction

Playwright is a powerful end-to-end testing library for web applications. It provides a simple API to automate browser actions, allowing developers to create robust and maintainable tests.

## Getting Started

To get started with Playwright, you'll need to install it as a dependency in your project:

```bash
cd bc_obps && make run
npm install @playwright/test
```

2.0 Ensure the client app is running:

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
cd client && npx playwright codegen http://localhost:3000
```

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
Run tests in the background using terminal command:

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

For debugging CI, you can download the HTML report artifact found in `GitHub\Actions\Test Registration App\Artifacts\ playwright-report` and extract the files to `bciers/playwright-report`. To view the downloaded the HTML report artifact locally run terminal command:

```bash
cd client && yarn nx run registration:e2e:report

```

[Debugging CI Playwright documentation](https://playwright.dev/docs/ci-intro#downloading-the-html-report).

**Traces**
Traces are normally run in a Continuous Integration(CI) environment, because locally you can use UI Mode for developing and debugging tests. However, if you want to run traces locally without using UI Mode, you can force tracing to be on with --trace on.

```bash
npx playwright test --trace on
```

**Opening the trace**
In the HTML report click on the trace icon next to the test name file name to directly open the trace for the required test, or run command:

```bash
cd client &&  npx playwright show-trace test-results/setup-trace.zip
```

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
