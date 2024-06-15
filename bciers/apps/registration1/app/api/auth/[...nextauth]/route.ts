import NextAuth from "next-auth";
import { authOptions } from "@/app/utils/auth/authOptions";

/**
📚 [...nextauth] is a catch all nextauth route
route.js is used to configuring NextAuth.js
You can define authentication providers, callbacks, refreshtoken, and other settings/functions as needed
*/

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
