import { DefaultSession } from "next-auth";

/*
📌 Module Augmentation
next-auth comes with certain types/interfaces that are shared across submodules, e.g. JWT or Session
Ideally, you should only need to create these types at a single place, and TS should pick them up in every location where they are referenced.
Module Augmentation is exactly that-
define your shared interfaces in a single place, and get type-safety across your application
*/

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string | undefined;
    access_token_expires_at: number | undefined;
    refresh_token?: string | undefined;
    id_token: string | undefined;
    user_guid: string | undefined;
    identity_provider: string | undefined;
    error?: string;
    app_role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    error?: string;
    identity_provider: string | undefined;
    user: {
      app_role?: string;
    } & DefaultSession["user"];
  }
}
