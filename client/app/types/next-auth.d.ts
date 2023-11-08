import { DefaultSession } from "next-auth";

/*
📌 Module Augmentation
<<<<<<< HEAD
next-auth comes with certain types/interfaces that are shared across submodules, e.g. JWT or Session
=======
next-auth comes with certain types/interfaces that are shared across submodules, e.g. Session and JWT
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
Ideally, you should only need to create these types at a single place, and TS should pick them up in every location where they are referenced.
Module Augmentation is exactly that-
define your shared interfaces in a single place, and get type-safety across your application
*/
<<<<<<< HEAD

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string | undefined;
    access_token_expires_at: number | undefined;
    refresh_token?: string | undefined;
    id_token: string | undefined;
    idir_user_guid: string | undefined;
    error?: string;
    role?: string;
  }
}

=======
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
<<<<<<< HEAD
=======
      // 👇️ Module augmentation to add 'roles' definition to the Session object
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
      role?: string;
    } & DefaultSession["user"];
  }
}
<<<<<<< HEAD
=======

declare module "next-auth/jwt" {
  // 👇️ Module augmentation to add 'role' definition to the JWT
  interface JWT {
    id_token: string | undefined;
    idir_user_guid: string | undefined;
    error?: string;
    role?: string;
  }
}
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
