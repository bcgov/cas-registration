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

```
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

If you want to access the testing playground, add `screen.logTestingPlaygroundURL()` to your test.

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

#### Writing Unit Tests

Because we're using Next 13's server-side components, there are a couple of new to-dos when setting up a test:

- mock `fetch`. In `beforeEach`, add `fetchMock.enableMocks();`, and in the test, mock the fetch values with `fetchMock.mockResponse([...whatever response you want])`
- react-testing-library can't render async components, so instead of `render(<Page />)`, use `render(await Page());`

### Unit tests for Django models

```shell
> cd bc_obps
> make start_pg
> poetry shell

> python manage.py test
```

#### Detail directions

1. Navigate to the `~/bc_obps` directory. Start Postgres with `make start_pg`. Start the Poetry shell with `poetry shell`.
2. Run `python manage.py test`.

### End-to-end Tests with Playwright

#### Run Playwright Specs

First, ensure the client app (`cd client && yarn dev`) and server (`cd bc_obps && make run`) are running.
Alternatively, you can uncomment the `webServer` array in `playwright.config.ts` to run the tests without running client and server separately.

For faster performance, build and run the app:

```bash
yarn build && yarn start
```

Then run the tests:

```bash
cd client && yarn e2e
```

To open last HTML report run:

```bash
cd client && yarn playwright show-report

```

### Debugging Playwright in CI

You can download the artifacts from the CI job and run the tests locally by following the steps in the [Playwright documentation](https://playwright.dev/docs/ci-intro#downloading-the-html-report).
