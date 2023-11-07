"use client";
/*
📚 Nextauth provider:
Import NextAuth.js SessionProvider as a client component because it uses context
Then export the client SessionProvider be used in server component app\layout.tsx
This enables sharing session state as context throught the application
*/
"use client";
import { SessionProvider } from "next-auth/react";
export default SessionProvider;
