# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Styling

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

### Unit Tests with Jest

```bash
cd client && yarn test
```

If you want to see `console.log` or more detail, add the `--verbose` flag.

If you want to see more HTML output, add `DEBUG_PRINT_LIMIT=1000000` (or any large number).

If you want to access the testing playground, add `screen.logTestingPlaygroundURL()` to your test (although if the URL is too long, the playground will be blank).

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

#### Writing Unit Tests

React Testing Library isn't entirely compatible with Next 13 yet, so a few things to note:

- To mock `fetch`,in `beforeEach`, add `fetchMock.enableMocks();`, and in the test, mock the fetch values with `fetchMock.mockResponse([...whatever response you want])`
- If you're testing a simple async component, you can use `render(await Operations());` instead of `render(<Operations />)`. If the component is more complicated (e.g., it imports other async components, or a mix of client/server), it appears there isn't yet a solution: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612

### Unit tests for Django models

```shell
> cd bc_obps
> make start_pg
> poetry shell

> python manage.py test
```

### Backend unit tests (for API endpoints) with Pytest

The easiest way to run these tests locally is by using commands from the Makefile.

```shell
> make pythontests              # standard pytest run
> make pythontests_verbose      # run pytest with verbose output (helpful for troubleshooting unit tests)
> make pythontests_watch        # adds a watcher that can run pytest in the background; unit tests will re-run whenever changes to a Python file are detected
> make pythontests_coverage     # run pytest with coverage report
```

#### Detail directions

1. Navigate to the `~/bc_obps` directory. Start Postgres with `make start_pg`. Start the Poetry shell with `poetry shell`.
2. Run `python manage.py test`.

### End-to-end Tests with Playwright

#### Run Playwright Specs

1.0 Ensure the server is running:

Start server from new terminal command:

```bash
cd bc_obps && make run
```

2.0 Ensure the client app is running:

Start client app from new terminal command:

```bash
cd client && yarn dev
```

2.1 Or, for faster performance:

Build and start client app from new terminal command:

```bash
cd client && yarn build && yarn start
```

Alternatively, you can uncomment the `webServer` array in `playwright.config.ts` to run the tests without running client and server separately.

3.0 Run the tests:

Run tests from new terminal command:

```bash
cd client && yarn e2e:ui
```

4.0 To open last HTML report run:

Open report from new terminal command:

```bash
cd client && yarn playwright show-report

```

### Debugging Playwright in CI

You can download the artifacts from the CI job and run the tests locally by following the steps in the [Playwright documentation](https://playwright.dev/docs/ci-intro#downloading-the-html-report).

### Debugging Django using Shell Plus

[Shell Plus](https://django-extensions.readthedocs.io/en/latest/shell_plus.html) is a Django extension that allows you to run a shell with all of your Django models and settings pre-loaded. This is useful for debugging and testing.
You can run Shell Plus with the following command:

```shell
> python manage.py shell_plus
```

### Sonarcloud Integration

Our project benefits from Sonarcloud integration, a static code analysis tool seamlessly integrated with Github. This integration is configured to automatically run on every pull request, identifying and reporting code issues for quick resolution. You can view the results and analysis insights on the [Sonarcloud dashboard](https://sonarcloud.io/project/overview?id=bcgov_cas-registration).

For advanced customization and configuration, we've provided a `.sonarcloud.properties` file. This file allows you to fine-tune Sonarcloud analysis settings to suit your project's unique requirements and code quality standards.
