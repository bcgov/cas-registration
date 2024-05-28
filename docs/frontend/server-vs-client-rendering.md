We decided to Next 13's new App Router and server side rendering for all pages. Reasons for this decision include:

- security

Here's how to create a new page:

- create a folder with the name of the route in the app folder (e.g. `app/operations` folder will create the `/operations` route)
- create a `page.tsx` inside that folder. By default, this will be a server component
- write an async function to fetch whatever data will be needed by that page
- write a component, and inside it await the fetching function
- if the page includes a form, we need to use a mix of client and server forms and functions. RJSF isn't compatible with server components, so RJSF forms must be client components imported into server components. To ensure form submission still happens on the server, the RJSF form `onSubmit` prop should be a server action.

See the `operations` folder for a page example. `OperationsForm` and `actionHandler` are an example of RJSF with server actions.
