import { DefaultSession } from "next-auth";

/*
📌 Module Augmentation
next-auth comes with certain types/interfaces that are shared across submodules, e.g. Session and JWT
Ideally, you should only need to create these types at a single place, and TS should pick them up in every location where they are referenced.
Module Augmentation is exactly that-
define your shared interfaces in a single place, and get type-safety across your application
*/
declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      // 👇️ Module augmentation to add 'roles' definition to the Session object
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // 👇️ Module augmentation to add 'role' definition to the JWT
  interface JWT {
    id_token: string | undefined;
    error?: string;
    role?: string;
  }
}
