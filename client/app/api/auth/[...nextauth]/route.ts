import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
📚 [...nextauth] is a catch all nextauth route
route.js is used to configuring NextAuth.js
You can define authentication providers, callbacks, refreshtoken, and other settings/functions as needed
*/

// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  providers: [
    //https://next-auth.js.org/providers/keycloak
    KeycloakProvider({
      clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
      clientSecret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
      issuer: `${process.env.KEYCLOAK_LOGIN_URL}`,
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
    // 👇️ called whenever a JSON Web Token is created
    async jwt({ token, account, profile }) {
      try {
        //📌  Provider account (only available on sign in)
        if (account) {
          //✨  On a new sessions, you can add information to the next-auth created token...
          // 🧩 custom properties are configured through module augmentation in client/app/types/next-auth.d.ts

          // 👇️ used for refresh token strategy
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expires_at = account.expires_at;

          // 👇️ used for federated logout, client/app/api/auth/logout/route.ts
          token.id_token = account.id_token;

          // 👇️ used for DJANGO API calls
          token.idir_user_guid = profile?.sub;
          /* sub: '58f255ed8d4644eeb2fe9f8d3d92c684@idir',
            idir_user_guid: '58F255ED8D4644EEB2FE9F8D3D92C684',*/

          //🚧 ???used for route access???
          token.role = "admin";
        } else {
          // checking if the current timestamp, obtained using Date.now(), is greater than the expiration time of a token
          if (Date.now() > (token.expires_at ?? 0) * 1000) {
            // 👇️ refreshes a token- returns a new token with updated properties
            const details = {
              clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
              clientSecret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
              grant_type: ["refresh_token"],
              refresh_token: token.refreshToken,
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
            token.accessToken = refreshedToken.access_token;
            token.refreshToken = refreshedToken.refresh_token;
            token.expires_at = refreshedToken.expires_at;
          }
        }
      } catch (error) {
        console.log(error);
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
      //🚨 🚨  By default, for security, only a subset of the token is returned...
      //💡 if you want to make a nextauth JWT property available to the client session...
      // you have to explicitly forward it here to make it available to the client
      //🚨 🚨  Do not expose sensitive information, such as access tokens.
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
