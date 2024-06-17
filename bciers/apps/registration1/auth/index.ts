import NextAuth from "next-auth";
import "next-auth/jwt";
import authConfig from "./auth.config";

/*
📌 Make one call to NextAuth and export all the returned objects
*/
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes matching Keycloak token expiration time
  },
  ...authConfig,
});
