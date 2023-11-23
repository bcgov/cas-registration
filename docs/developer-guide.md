# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Next.js 14

**TLDR**

Architectural design using Next.js 14 includes employing a hierarchical structure of React server components as much as possible to enhance page loading and performance. Nested client pages are utilized whenever user interactions or event handling are required. An improved user experience is achieved through the use of layout.tsx, loading.tsx, and error.tsx components, in conjunction with Suspense components that enable the display of a fallback while asynchronous content is being loaded. The data-fetching pattern involves server actions for server side fetching security, for centralizing data access management, and for reduced API route definitions.

Next.js 14 foundation is the App Router which boasts a range of features, including:

[Routing](https://nextjs.org/docs/app/building-your-application/routing)
Creating routes involves creating folders within the app directory and nesting a page.tsx file within the appropriate folder to define your route.

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

### Backend unit tests (for API endpoints) with Pytest

The easiest way to run these tests locally is by using commands from the Makefile.

```shell
> make pythontests              # standard pytest run
> make pythontests_verbose      # run pytest with verbose output (helpful for troubleshooting unit tests)
> make pythontests_watch        # adds a watcher that can run pytest in the background; unit tests will re-run whenever changes to a Python file are detected
> make pythontests_coverage     # run pytest with coverage report
> make pythontests ARGS='registration/tests/<file_name.py>' # run pytest for a specific file
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

```bash
> python manage.py shell_plus
```

### Sonarcloud Integration

Our project benefits from Sonarcloud integration, a static code analysis tool seamlessly integrated with Github. This integration is configured to automatically run on every pull request, identifying and reporting code issues for quick resolution. You can view the results and analysis insights on the [Sonarcloud dashboard](https://sonarcloud.io/project/overview?id=bcgov_cas-registration).

For advanced customization and configuration, we've provided a `.sonarcloud.properties` file. This file allows you to fine-tune Sonarcloud analysis settings to suit your project's unique requirements and code quality standards.

### Entity-Relationship Diagram (ERD) Generation

We use [Mermaid](https://mermaid-js.github.io/mermaid/) to create ERD diagrams for our data models. The [django-diagram](https://github.com/nick-solly/django-diagram) package enables the generation of ERD diagrams specific to our Django models.

To generate the most recent ERD diagram, navigate to the `bc_obps` directory (where the `manage.py` file is located) and execute the following command in your terminal:

```bash
poetry run python -m django_diagram --app=registration --output=../erd.md --settings=bc_obps.settings

```
