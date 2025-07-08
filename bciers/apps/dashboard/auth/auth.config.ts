import type { DefaultSession, NextAuthConfig } from "next-auth";
import Keycloak, { KeycloakProfile } from "next-auth/providers/keycloak";
import { Errors, IDP } from "@bciers/utils/src/enums";
import { actionHandler } from "@bciers/actions";
import { augmentJwt } from "./augmentJwt";

/*
📌 Module Augmentation
next-auth comes with certain types/interfaces that are shared across submodules, e.g. JWT or Session
Ideally, you should only need to create these types at a single place, and TS should pick them up in every location where they are referenced.
Module Augmentation is exactly that-
define your shared interfaces in a single place, and get type-safety across your application
*/

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    error?: string;
    identity_provider: string | undefined;
    user: {
      // Add additional properties here:
      user_guid: string | undefined;
      bceid_business_name: string | undefined;
      bceid_business_guid: string | undefined;
      app_role?: string;
      given_name?: string;
      family_name?: string;
      full_name?: string;
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"];
  }
  /** Returned by getToken from "@auth/core/jwt */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    access_token?: string | undefined;
    user_guid: string | undefined;
    identity_provider: string | undefined;
    error?: string;
    app_role?: string;
    given_name?: string;
    family_name?: string;
    full_name?: string;
    bceid_business_name: string | undefined;
    bceid_business_guid: string | undefined;

    expires_at: number | undefined;
    refresh_token: string | undefined;
  }
}

/*
📌 Make one central auth config that can be imported to auth.ts or middleware when required
*/
export const AUTH_BASE_PATH = "/api/auth";
export const OAUTH_TOKEN_ROTATION_INTERVAL_SECONDS = 60;

export default {
  //In a Docker environment, make sure to set either trustHost: true in your Auth.js configuration or the AUTH_TRUST_HOST environment variable to true.
  trustHost: true,
  basePath: AUTH_BASE_PATH,
  providers: [
    Keycloak({
      clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
      clientSecret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
      issuer: `${process.env.KEYCLOAK_LOGIN_URL}`,
      profile(profile: KeycloakProfile) {
        return {
          ...profile,
          id: profile.sub,
        };
      },
    }),
  ],
  secret: `${process.env.NEXTAUTH_SECRET}`,
  pages: {
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  callbacks: {
    async jwt({ token, account, profile, trigger }) {
      return augmentJwt(token, account, profile, trigger);
    },
    async session({ token, session }) {
      // By default, for security, only a subset of the token is returned...
      //💡 if you want to make a nextauth JWT property available to the client session...
      // you have to explicitly forward it here to make it available to the client
      //🚨  Do not expose sensitive information, such as access-tokens.
      return {
        ...session,
        error: token.error,
        identity_provider: token.identity_provider,
        user: {
          ...session.user,
          // IDIR users will not have a bceid_business guid/name. We set default values here so that the model fields can be not null for all users.
          // Business BCeID users will have these values set by the token & these values cannot be null or empty in the database.
          bceid_business_guid:
            token.identity_provider === "idir"
              ? "00000000-0000-0000-0000-000000000000"
              : token.bceid_business_guid,
          bceid_business_name:
            token.identity_provider === "idir"
              ? "BCGOV"
              : token.bceid_business_name,
          given_name: token.given_name,
          family_name: token.family_name,
          full_name: token.full_name,
          app_role: token.app_role,
        },
      };
    },
    // 👇️ called anytime the user is redirected to a callback URL (e.g. on signin or signout).
    // by default only URLs on the same URL as the site are allowed, you can use the redirect callback to customise that behaviour.
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      // 🛸 Allow callbacks to identity server for federated signout after next-auth SignOut()
      else if (new URL(url).origin === process.env.SITEMINDER_AUTH_URL)
        return url;
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;
