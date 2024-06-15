/*
📚 Nextauth provider:
Import NextAuth.js SessionProvider as a client component because it uses context
Then export the client SessionProvider to be used in server component client\layout.tsx
This enables sharing session state as context throughout the application
*/
"use client";
import { SessionProvider } from "next-auth/react";
export default SessionProvider;
