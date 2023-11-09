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
    refresh_token?: string | undefined;
    expires_at?: number | undefined;
    id_token: string | undefined;
    idir_user_guid: string | undefined;
    error?: string;
    role?: string;
  }
}

declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}
