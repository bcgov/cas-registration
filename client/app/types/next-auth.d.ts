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
    user_guid: string | undefined;
    identity_provider: string | undefined;
    error?: string;
    app_role?: string;
    given_name?: string;
    family_name?: string;
    full_name?: string;
    bceid_business_name: string | undefined;
    bceid_business_guid: string | undefined;
  }
}

declare module "next-auth" {
  interface Session {
    error?: string;
    identity_provider: string | undefined;
    user: {
      user_guid: string | undefined;
      bceid_business_name: string | undefined;
      bceid_business_guid: string | undefined;
      app_role?: string;
      given_name?: string;
      family_name?: string;
      full_name?: string;
    } & DefaultSession["user"];
  }
}
