import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider, {
  KeycloakProfile,
} from "next-auth/providers/keycloak";
import { Errors, IDP, Roles } from "@/app/utils/enums";
import { actionHandler } from "@/app/utils/actions";

/**
📚 [...nextauth] is a catch all nextauth route
route.js is used to configuring NextAuth.js
You can define authentication providers, callbacks, refreshtoken, and other settings/functions as needed
*/

// https://next-auth.js.org/configuration/options
// Use authOptions when calling getServerSession(authOptions) from the server-side i.e. in React Server Components, Route Handlers, API routes
export const authOptions: NextAuthOptions = {
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
  //https://next-auth.js.org/configuration/pages
  pages: {
    error: "/auth/error", // Error code passed in query string as ?error=
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
        if (profile) {
          token.given_name = (profile as KeycloakProfile).given_name;
          token.family_name = (profile as KeycloakProfile).family_name;
        }
        //📌  Provider account (only available on sign in)
        if (account) {
          // ✨  On a new sessions, you can add information to the next-auth created token...
          // 🧩 custom properties are configured through module augmentation in client/app/types/next-auth.d.ts

          // 👇️ used for refresh token strategy
          token.access_token = account.access_token;
          token.access_token_expires_at = account.expires_at;
          token.refresh_token = account.refresh_token;

          // 👇️ used for federated logout, client/app/api/auth/logout/route.ts
          token.id_token = account.id_token;

          // 👇️ used for routing and DJANGO API calls
          token.user_guid = account.providerAccountId.split("@")[0];

          token.identity_provider = account.providerAccountId.split("@")[1];
        }
        // If no token.app_role, augment the keycloak token with cas registration user approle
        if (!token.app_role) {
          // 🚀 API call: Get user app_role by user_guid from user table
          const responseRole = await actionHandler(
            `registration/user-app-role/${token.user_guid}`,
            "GET",
          );
          if (responseRole?.role_name) {
            // user found in table, assign role to token
            token.app_role = responseRole.role_name;

            //for bceid users, augment with admin based on operator-user table
            if (token.identity_provider === IDP.BCEIDBUSINESS) {
              try {
                // 🚀 API call: check if user is admin approved
                const responseAdmin = await actionHandler(
                  `registration/is-approved-admin-user-operator/${token.user_guid}`,
                  "GET",
                );
                if (responseAdmin?.approved) {
                  token.app_role = Roles.INDUSTRY_USER_ADMIN;
                } else {
                  // Default app_role if the API call fails
                }
              } catch (error) {
                // Default app_role if there's an error in the API call
              }
            }
          } else {
            // 🛸 Routing: no app_role user found; so, user will be routed to dashboard\profile
          }
        }
        // 🕐 evaluate if the access_token_expires_at timestamp is less than the current timestamp, indicating an expired token
        if (
          (token.access_token_expires_at ?? 0) < Math.floor(Date.now() / 1000)
        ) {
          // 👇️ refresh token- returns a new token with updated properties
          try {
            /*
              Keycloak provides a REST API enables the creation of an access_token through a POST endpoint with application/x-www-form-urlencoded outcome
              Method: POST
                URL: https://keycloak.example.com/auth/realms/myrealm/protocol/openid-connect/token
                Body type: x-www-form-urlencoded
                Form fields:
                client_id :
                client_secret :
                grant_type : refresh_token
                refresh_token:
              */
            const details = {
              client_id: `${process.env.KEYCLOAK_CLIENT_ID}`,
              client_secret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
              grant_type: ["refresh_token"],
              refresh_token: token.refresh_token,
            };
            const formBody: string[] = [];
            Object.entries(details).forEach(([key, value]: [string, any]) => {
              const encodedKey = encodeURIComponent(key);
              const encodedValue = encodeURIComponent(value);
              formBody.push(encodedKey + "=" + encodedValue);
            });
            const formData = formBody.join("&");
            const url = `${process.env.KEYCLOAK_TOKEN_URL}`;
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded;charset=UTF-8",
              },
              body: formData,
            });
            const refreshedToken = await response.json();
            if (!response.ok) throw refreshedToken;
            return {
              ...token,
              error: refreshedToken.error,
              access_token: refreshedToken.access_token,
              access_token_expires_at:
                Math.floor(Date.now() / 1000) +
                (refreshedToken.refresh_expires_in ?? 0),
              refresh_token:
                refreshedToken.refresh_token ?? token.refresh_token, // Fall back to old refresh token
            };
          } catch (error) {
            token.error = Errors.ACCESS_TOKEN;
          }
        } else {
          // The token is still valid; no need to refresh
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
          given_name: token.given_name,
          family_name: token.family_name,
          app_role: token.app_role,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
