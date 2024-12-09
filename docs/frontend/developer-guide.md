# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

## Next.js 14

**TLDR**

Architectural design using Next.js 14 includes employing a hierarchical structure of React server components as much as possible to enhance page loading and performance. Nested client pages are utilized whenever user interactions or event handling are required. An improved user experience is achieved through the use of layout.tsx, loading.tsx, and error.tsx components, in conjunction with Suspense components that enable the display of a fallback while asynchronous content is being loaded. The data-fetching pattern involves server actions for server side fetching security, for centralizing data access management, and for reduced API route definitions.

Next.js 14 foundation is the App Router which boasts a range of features, including:

[Security](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist?ref=blog.arcjet.com#security)

**Security Strengths:**

- **Content Security Policy (CSP) by Default:** Next.js enforces a Content Security Policy (CSP) by default, which helps mitigate various attacks like XSS (Cross-Site Scripting) and clickjacking. You can further customize the CSP for stricter security.

**Security Considerations:**

- **Server Actions:** Server Actions in Next.js 14 offer more flexibility for data fetching on the server-side. However, this power comes with responsibility. You need to be extra careful to ensure proper authorization and validation for server actions to prevent unauthorized access or malicious code injection.

- **Taints:** Next.js 14 introduces the concept of taints, which can help track the origin of data and prevent unauthorized data exposure. However, utilizing taints effectively requires a good understanding of the feature and potential security implications.

- **General Best Practices:** Here are some general security best practices that apply to Next.js 14:
  - **Never expose sensitive data on the client-side.** This includes secret keys, passwords, or other confidential information.
  - **Validate all user input.** Sanitize and validate any data coming from the user to prevent injection attacks.
  - **Use a secure authentication library.** Consider using libraries like NextAuth.js to handle user authentication securely.
  - **Stay up-to-date.** Keep your Next.js version and dependencies updated to benefit from the latest security fixes.

[Routing](https://nextjs.org/docs/app/building-your-application/routing)
Creating routes involves creating folders within the app directory and nesting a page.tsx file within the appropriate folder to define your route. Note: our `withAuthorization` middleware removes the first three folders (e.g. authenticated/bceidbudiness/industry_user) from the route, so all the URLs within the app will start with `dashboard` instead of `authenticated/.../dashboard`.

[Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
By default, all app router components are react server components and if you want to write a client component you need to mark them explicitly using the "use client"; directive.
We use server components, which render on the server, as much as possible to accelerate page load times as different page contents are loaded in small chunks and independently.
We use client components when ever we need user interactions or event handling such as click events and React hooks (useState, useRef).
This means Next.js can have a component hierarchy to combine server and client components.

Here's how to create a new page:

- create a folder with the name of the route in the app folder (e.g. `app/operations` folder will create the `/operations` route)
- create a `page.tsx` inside that folder. By default, this will be a server component
- write an async function to fetch whatever data will be needed by that page
- write a component, and inside it await the fetching function
- if the page includes a form, we need to use a mix of client and server forms and functions. RJSF isn't compatible with server components, so RJSF forms must be client components imported into server components. To ensure form submission still happens on the server, the RJSF form `onSubmit` prop should be a server action.

See the `operations` folder for a page example. `OperationsForm` and `actionHandler` are an example of RJSF with server actions.

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

## Auth.js

Auth.js provides JWT-based user session strategy using JSON Web Tokens (JWT). When a user signs in, a JWT is created in a HttpOnly cookie. Making the cookie HttpOnly prevents JavaScript from accessing it client-side (via document.cookie, for example), which makes it harder for attackers to steal the value. In addition, the JWT is encrypted with a secret key only known to the server. So, even if an attacker were to steal the JWT from the cookie, they could not decrypt it. Combined with a short expiration time, this makes JWTs a secure way to create sessions. When a user signs out, Auth.js deletes the JWT from the cookies, destroying the session.
This JWT session strategy allows logging in once, for the time the JWT is valid, so users do not have to log in every single time they visit the site.

Auth.js has a concept of providers, which define the services that can be used to sign in, in this app the provider is keycloak.

Since Auth.js creates its own token, it doesn't automatically give you access to the original information from the IDIR keycloak provider. However, the Auth options object provides callback functions that allow propagation of information from provider JWT to Auth JWT within the encrypted server-side token or the non-encrypted client-side session objects.

Before getting started, make sure you have a working Keycloak instance with the required configurations:

- auth-server-url
- realm
- resource
- credentials\secrets

`bciers/apps/dashboard/auth/auth.config.ts` defines the options object for the keycloak authentication provider, session settings, JWT settings, and callbacks for sign-in, redirect, and session management.

Once the Auth options object is configured, calls to `signIn("keycloak")` will direct user to the keycloak sign in form. Successful IDIR login will redirect to callback defined in NEXTAUTH_URL. Failed IDIR login will redirect to callback NEXTAUTH_URL error page.

### Auth Session Sharing

By implementing Next.js [multi-zone feature](https://nextjs.org/docs/pages/building-your-application/deploying/multi-zones), where you have multiple Next.js apps running under the same domain but on different subdomains or paths, so the Auth.js authentication token and session objects can be shared across our mono-repo apps.
Our dashboard app's `next.config.js` manages the rewrites mapping an incoming request path to a different destination path, and all other multi-zone app's have configured `next.config.js\basePath` as the project folder.

### Middleware

Next.js [Middleware ](https://nextjs.org/docs/advanced-features/middleware) allows control over requests before they are completed. Responses can be modified based on conditions such as authentication session.
Our apps use chained middlewares to improves code readability, and maintainability. A project's `/middlewares/withAuthorization{ProjectName}` middleware secures the app routes using Auth.js authentication JWT obtained from the IDIR keycloak provider. Based on the Auth.js JWT properties of identity_provider and user role, the middleware dynamically rewrites the request URL to the appropriate folder structure thereby enforcing both authentication and authorization.

### Routing and Folder Structure

The Registration1 and Registration code is organized into sub-folders based on a identity provider, an application role, and dashboard folder, or just dashboard folder for routes available for authenticated users without an authorization role. As mentioned, the middleware dynamically rewrites the request URL based on the Auth.js JWT properties of identity_provider and user role so to match our sub-folder structure. So route URL segments such as registration1 `http://localhost:3000/dashboard/operations` would get mapped to nested folder `bciers/apps/registration1/app/(authenticated)/bceidbusiness/industry_user/dashboard/operations' for an authenticated industry user.

For our multi-zone apps, the dashboard app manages the main domain and rewites request to the appropriate zone as defined in `bciers/apps/dashboard/next.config.js` and `bciers/apps/dashboard/middlewares/withAuthorizationDashboard.ts`.

### Folder Structure & Dashboard Tiles

The base directory where all the dashboard-related JSON files are stored is `bc_obps/common/fixtures/dashboard/`. The folder structure for the .json files in the project follows a specific pattern, which includes an optional part. Here's the complete structure:

`bc_obps/common/fixtures/dashboard/{project}/{identity-provider-type}_{optional_userole}.json`

`{project}/`: This represents the specific project folder. Replace {project} with the name of the project.

`{identity-provider-type}`: This folder indicates the type of identity provider. Replace `{identity-provider-type}` with the relevant type (e.g., external, internal).

`{optional_userole}`: This part of the file name is optional and can include an underscore followed by a user role. If not needed, this part can be omitted entirely.

The .json file then sets the dashboard tile links' href property as per the project's folder structure.

#### Key Fields in JSON:

- **`dashboard`**: Specifies the type of dashboard, in this case, `"administration"`.
- **`access_roles`**: An array of roles that can access this dashboard. Here, it includes `"industry_user"` and `"industry_user_admin"`.
- **`tiles`**: An array of tiles (menu items), where each tile includes:
  - **`title`**: The title of the tile, which appears on the dashboard.
  - **`icon`**: The icon name representing the tile visually.
  - **`content`**: A short description of what the tile is for.
  - **`href`**: The link or path to navigate to when the tile is clicked.
  - **`conditions`**: An array of condition objects. These determine whether the tile should be displayed or not, based on certain API responses and field values.

#### Tile Example:

```json
{
  "title": "Select an Operator",
  "icon": "Layers",
  "content": "Select your operator here.",
  "href": "/administration/select-operator",
  "conditions": [
    {
      "api": "registration/user-operators/current/operator",
      "field": "error",
      "operator": "exists",
      "value": true
    }
  ]
}
```

### Condition Structure

Each tile's visibility can be controlled by one or more conditions. A condition consists of:

- **`api`**: The API endpoint that will return the data to evaluate.
- **`field`**: The specific field in the API response to check.
- **`operator`**: The comparison operator, such as:
  - `"equals"`: Checks if the field value equals the specified `value`.
  - `"notEquals"`: Checks if the field value does not equal the specified `value`.
  - `"exists"`: Checks if the field exists.
  - `"notExists"`: Checks if the field does not exist.
- **`value`**: The value to compare against the field, based on the operator.

### `evalDashboardRules` Function

This function processes the dashboard items (tiles) and evaluates their conditions using API requests. It filters out any tiles or links whose conditions are not met, returning only the valid ones.
This mechanism allows the dashboard to dynamically display or hide certain tiles based on API responses, providing a personalized experience for users based on their specific data and status.

### Folder Structure & Dynamic Breadcrumbs

The Bread.tsx component in the `bciers/libs/components/src/navigation` directory dynamically builds breadcrumbs based on the folder structure. To exclude certain folders from appearing in the breadcrumbs, you can use Route groups (i.e., a folder named in parenthesis, such as (authentication)), which are not included in the route's URL path, or you can apply conditional logic within the component.

For instance, when dealing with UUID breadcrumbs from dynamic folders, the component passes the name associated with the UUID record via the query string. The Bread component utilizes the translateNumericPart function to handle UUID segments, identifying the correct query string parameter and rendering the name instead of the UUID number.

The pattern for the query string parameter should follow the format `{name-of-preceding-folder}_title`. For example, the OperationDataGridPage is displayed from the route `bciers/apps/administration/app/bceidbusiness/industry_user_admin/operations`, and the View Details link includes the parameter `?operations_title` for the route `bciers/apps/administration/app/bceidbusiness/industry_user_admin/operations/[operatorId]`.

## Styling

[CSS theme guide](/docs/css-theme-guide.md)

### MUI v5

[Material-UI (MUI)](https://mui.com/material-ui/getting-started/) is a popular open-source UI framework for React applications that is based on Google's Material Design guidelines. It provides a wide range of reusable and customizable components and styles to help you build modern, attractive, and responsive web applications

Material-UI has been configured for Next.js app router using a theme registry component (/cas-registration/bciers/apps/registration1/app/components/theme/ThemeRegistry.tsx) as a provider to the children within the root layout (/cas-registration/bciers/apps/registration1/app/layout.tsx) and providing config option in bciers/apps/registration1/next.config.js.

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a popular utility-first CSS framework that is designed to simplify and streamline the process of building modern, responsive web interfaces. It focuses on providing a set of highly reusable utility classes that you can apply directly to your HTML elements to style and structure.

Tailwind has been configured to work with MUI within bciers/apps/registration1/tailwind.config.js as per [intergration documentation](https://mui.com/material-ui/guides/interoperability/#tailwind-css)

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
