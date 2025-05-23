import NextAuth from "next-auth";
import authConfig from "./auth.config";

/*
📌 Make one call to NextAuth and export all the returned objects
*/
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 10 * 60, // NOTE: 30 * 60 = 30 minutes auth.js lifetime - matching Keycloak token expiration time
  },
  ...authConfig,
});
