# Vitest Guidelines

## Unit Tests with Vitest

- To run Vitest unit tests on a specific project: `yarn nx run {project}:test`.
- To run Vitest unit tests on all projects: `yarn nx run-many -t test`.
- To run playwright end-to-end tests: `nx run {project}:e2e` (For the first time, you may need to run `yarn playwright install ` to install the browsers)

**Or**, you can use the scripts available in `bciers/package.json`

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

#### Vitest Helpers

A collection of reusable helpers for simplifying and standardizing writing test cases by abstracting repetitive test logic into reusable functions. Found at `bciers/libs/testConfig/src/helpers/*`

### Vitest Helpers Summary

This is a collection of reusable helpers for simplifying and standardizing test case writing in React applications. These helpers are built with `@testing-library/react` and `@testing-library/user-event`.

---

### **1. `expectButton`**

Verifies the visibility and state (enabled or disabled) of a button identified by its accessible name.

### **2. `expectField`**

Checks that an input field with a specific label is visible, editable, and matches an expected value.

### **3. `expectHeaders`**

Asserts the presence and visibility of a list of headers (e.g., `<h1>`, `<h2>`) in the document.

### **4. `expectIcons`**

Ensures that a set of icons with specific accessible names is visible in the document.

### **5. `expectParam`**

Validates that a query parameter in the URL matches an expected value.

### **6. `expectMessage`**

Verifies the visibility of a specific message or text on the page.

### **7. `fillMandatoryFields`**

Automates filling out mandatory form fields using predefined labels, field types, and test data.

### **8. `mockUseSession`**

Mocks the `useSession` hook for testing authentication-related functionality by simulating session data.

### **9. `selectComboboxOption`**

Selects a specific option from a combobox (dropdown) by its label or accessible name.
