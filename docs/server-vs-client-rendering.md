We decided to Next 13's new App Router and server side rendering for all pages. Reasons for this decision include:

- security

Here's how to create a new page and set up the cache:

- create a folder with the name of the route in the app folder (e.g. `app/operations` folder will create the `/operations` route)
- create a `page.tsx` inside that folder. By default, this will be a server component
- at the top of `page.tsx`, add the line `export const dynamic = "force-dynamic";`. This will opt-out of Next 13's aggressive server caching
- write an async function to fetch whatever data will be needed by that page
- write a component, and inside it await the fetching function
- likely, this server page will need to render some client components. Inside the client component, whenever you need to refresh page data, call `utils/forceRefresh([route-to-refresh])`. This resets Next 13's aggressive client caching.

See the `operations` folder and `operationsForm` for an example. More information on this solution can be found here: https://github.com/vercel/next.js/discussions/51612
