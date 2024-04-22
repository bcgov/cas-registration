# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

### NextAuth with Keycloak

NextAuth.js is a library specifically designed to handle authentication solutions in Next.js apps, see [NextAuth.js repo](https://github.com/nextauthjs/next-auth) to learn more.
NextAuth.js has a concept of providers, which define the services that can be used to sign in, in this app the provider is keycloak.

Before getting started, make sure you have a working Keycloak instance with the required configurations:

- auth-server-url
- realm
- resource
- credentials\secrets

Client/app/api/auth/[...nextauth] defines the options object for the keycloak authentication provider, session settings, JWT settings, and callbacks for sign-in, redirect, and session management. For configuration values, see [1Password](https://climateactionsecretariat.1password.ca/) documents: `OBPS FE env.local` and `OBPS FE env`

Once the NextAuth options object is configured, calls to NextAuth route `/api/auth/signin/keycloak`, triggered from `next-auth/react: signIn("keycloak")`, will direct user to the keycloak sign in form. Successful IDIR login will redirect to callback defined in NEXTAUTH_URL. Failed IDIR login will redirect to callback NEXTAUTH_URL error page (client/app/auth/error/page.tsx).

Since next-auth creates its own token, it doesn't automatically give you access to the original information from the IDIR keycloak provider.
However, the NextAuth options object provides callback functions that allow propagation of information from provider JWT to NextAuth JWT. Case in point, the keycloak JWT id_token is applied to the NextAuth JWT in JWT calback within `client/app/api/auth/[...nextauth]/route.ts` to enable federated, single sign out, through custom api route `/api/auth/logout` before ending the NextAuth session through NextAuth route `/api/auth/signout`, triggered from `next-auth/react: signOut()`.

### middleware

Next.js [Middleware ](https://nextjs.org/docs/advanced-features/middleware) allows control over requests before they are completed. Responses can be modified based on conditions such as authentication session or language detection along with implementing persistence via cookie.
Client\middleware implements middleware to secured the app routes based on NextAuth authentication JWT from the IDIR keycloak provider.
