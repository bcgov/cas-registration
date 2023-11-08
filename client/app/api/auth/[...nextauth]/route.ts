import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

/**
📚 [...nextauth] is a catch all nextauth route
route.js is used to configuring NextAuth.js
You can define authentication providers, callbacks, refreshtoken, and other settings/functions as needed

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
*/

export const authOptions: NextAuthOptions = {
  providers: [
    //https://next-auth.js.org/providers/keycloak
    KeycloakProvider({
      clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
      clientSecret: `${process.env.KEYCLOAK_CLIENT_SECRET}`,
      issuer: `${process.env.KEYCLOAK_LOGIN_URL}`, //Note: issuer should include the realm
    }),
  ],
  //https://next-auth.js.org/configuration/pages
  pages: {
    error: "/auth/error", // Error code passed in query string as ?error=
  },
  //https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // 👇️ called whenever a JSON Web Token is created
    async jwt({ token, account, profile }) {
      try {
        if (account) {
          //📌  Account is only available on a new session (after the user signs in)
          // On a new sessions, you can add information to the next-auth created token
          // 🧩 custom properties are configured through module augmentation in client/app/types/next-auth.d.ts

          // 👇️ used for federated logout, client/app/api/auth/logout/route.ts
          token.id_token = account.id_token;
          // 👇️ used for DJANGO API calls
          token.idir_user_guid = profile?.sub;
          /* sub: '58f255ed8d4644eeb2fe9f8d3d92c684@idir',
            idir_user_guid: '58F255ED8D4644EEB2FE9F8D3D92C684',*/

          //🚧 used for route access
          token.role = "user";
        }
      } catch (error) {
        console.log(error);
      }
      // 🔒 returns encrypted nextauth JWT
      return token;
    },
    // 👇️ called whenever a session is checked
    async session({ session, token }) {
      // Token interceptor to add token info to the session to use on client pages.
      /*By default, only a subset of the token is returned for increased security.
       💡 If you want to make something available that you added to the token in the jwt() callback,
      you have to explicitly forward it here to make it available to the client.*/

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
