import NextAuth, { NextAuthConfig } from "next-auth";
import KeycloakProvider, {
  KeycloakProfile,
} from "next-auth/providers/keycloak";
import { Errors, IDP } from "@/app/utils/enums";
import { actionHandler } from "@/app/utils/actions";

/**
📚 [...nextauth] is a catch all nextauth route
route.js is used to configuring NextAuth.js
You can define authentication providers, callbacks, refreshtoken, and other settings/functions as needed
*/

// https://next-auth.js.org/configuration/options
// Use authOptions when calling getServerSession(authOptions) from the server-side i.e. in React Server Components, Route Handlers, API routes
export const authOptions: NextAuthConfig = {
  providers: [
    //https://next-auth.js.org/providers/keycloak
    KeycloakProvider({
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
  //https://next-auth.js.org/configuration/nextjs#secret
  secret: `${process.env.NEXTAUTH_SECRET}`,
  //https://next-auth.js.org/configuration/pages
  pages: {
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  // https://next-auth.js.org/configuration/options#session
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes matching Keycloak token expiration time
  },
  //https://next-auth.js.org/configuration/callbacks
  callbacks: {
    /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */
    // 👇️ called whenever a JSON Web Token is created/updated
    async jwt({ token, account, profile }) {
      try {
        // 🧩 custom properties are configured through module augmentation in client/app/types/next-auth.d.ts
        if (profile) {
          token.given_name = (profile as KeycloakProfile).given_name;
          token.family_name = (profile as KeycloakProfile).family_name;
          token.bceid_business_name = (
            profile as KeycloakProfile
          ).bceid_business_name;
          token.bceid_business_guid = (
            profile as KeycloakProfile
          ).bceid_business_guid;
        }
        //📌  Provider account (only available on sign in)
        if (account) {
          // ✨  On a new sessions, you can add information to the next-auth created token...

          // 👇️ used for routing and DJANGO API calls
          token.user_guid = account.providerAccountId.split("@")[0];

          token.identity_provider = account.providerAccountId.split("@")[1];
        }

        //📌 API call notes:
        // since API calls are made before JWT token is returned
        // the actionHandler cannot get user_guid from `getToken`
        // so, add parameter `token.user_guid` for actionHandler to use in Authorization header

        // 🚀 API call: Get user name from user table
        const response = await actionHandler(
          `registration/user/user-profile/${token.user_guid}`,
          "GET",
        );
        const { first_name: firstName, last_name: lastName } = response || {};
        if (firstName && lastName) {
          token.full_name = `${firstName} ${lastName}`;
        } else {
          token.full_name = `${token.given_name} ${token.family_name}`;
        }
        // If no token.app_role, augment the keycloak token with cas registration user app_role
        if (!token.app_role) {
          // 🚀 API call: Get user app_role by user_guid from user table
          const responseRole = await actionHandler(
            `registration/user/user-app-role/${token.user_guid}`,
            "GET",
          );
          if (responseRole?.role_name) {
            // user found in table, assign role to token (note: all industry users have the same app role of `industry_user`, and their permissions are further defined by their role in the UserOperator model)
            token.app_role = responseRole.role_name;
            //for bceid users, augment with admin based on operator-user table
            if (token.identity_provider === IDP.BCEIDBUSINESS) {
              try {
                // 🚀 API call: check if user is admin approved
                const responseAdmin = await actionHandler(
                  `registration/user-operators/current/is-current-user-approved-admin/${token.user_guid}`,
                  "GET",
                );
                if (responseAdmin?.approved) {
                  token.app_role = "industry_user_admin"; // note: industry_user_admin a front-end only role. In the db, all industry users have an industry_user app_role, and their permissions are further defined by UserOperator.role
                } else {
                  // Default app_role (industry_user) if the API call fails
                }
              } catch (error) {
                // Default app_role (industry_user) if there's an error in the API call
              }
            }
          } else {
            // 🛸 Routing: no app_role user found; so, user will be routed to dashboard\profile
          }
        }
      } catch (error) {
        token.error = Errors.ACCESS_TOKEN;
      }
      // 🔒 return encrypted nextauth JWT
      return token;
    },
    /**
     * @param  {object} session      Session object
     * @param  {object} token        User object    (if using database sessions)
     *                               JSON Web Token (if not using database sessions)
     * @return {object}              Session that will be returned to the client
     */
    // 👇️ called whenever a session is checked
    async session({ session, token }) {
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
      // 🛸 Allow callbacks to identity server for federated signout after next-auth SignOut(): client/app/components/navigation/Profile.tsx
      else if (new URL(url).origin === process.env.SITEMINDER_AUTH_URL)
        return url;
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
