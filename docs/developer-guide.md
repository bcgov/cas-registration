# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Testing

### Unit Tests with Jest

```bash
cd client && yarn test
```

Front-end unit tests include snapshots. Work that changes the DOM will result in a diff from the last accepted snapshot and cause related tests to fail. You can update the snapshots and review / accept the diff with `yarn test -u`.

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
