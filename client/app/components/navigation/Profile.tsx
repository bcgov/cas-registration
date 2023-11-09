import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 650d9e4 (🚧 feat: nextauth refreshtoken client side)
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

// 🛠️ Function for keycloak session logout
async function keycloakSessionLogOut() {
  try {
    // call keycloak
    const response = await fetch(`/api/auth/logout`, { method: "GET" });
    if (!response.ok) {
      // redirect to keycloak basic logout SSO page
      window.open(process.env.NEXT_PUBLIC_KEYCLOAK_LOGOUT_URL, "_blank");
    }
    // call nextauth logout
    signOut();
=======
import { signOut } from "next-auth/react";

// 🛠️ Function for keycloak session logout
async function keycloakSessionLogOut() {
  try {
<<<<<<< HEAD
    await fetch(`/api/auth/logout`, { method: "GET" });
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
    // call keycloak
    const response = await fetch(`/api/auth/logout`, { method: "GET" });
    if (!response.ok) {
      // redirect to keycloak basic logout SSO page
      window.open(process.env.NEXT_PUBLIC_KEYCLOAK_LOGOUT_URL, "_blank");
    }
    // call nextauth logout
    signOut();
>>>>>>> 42b636c (🚧 nextauth SSO)
  } catch (err) {
    console.error(err);
  }
}
<<<<<<< HEAD
<<<<<<< HEAD

export default function Profile({ name }: { readonly name: string }) {
<<<<<<< HEAD
<<<<<<< HEAD
  /* use the NextAuth useSession hook to get session data, and if a specific error condition is met,
     triggers a forced sign-in using the "keycloak" provider to potentially resolve the error related to refreshing access tokens.*/
  const { data: session } = useSession();
  // 👇️ run function whenever the session object changes e.g. session.error changes
  useEffect(() => {
    if (session?.error === "ErrorAccessToken") {
      signIn("keycloak"); // Force sign in to hopefully resolve error
    }
  }, [session]);
=======
=======

>>>>>>> 42b636c (🚧 nextauth SSO)
export default function Profile({ name }: { name: string }) {
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
>>>>>>> 6734a9f (🦨 fix: code smell)
=======
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === "ErrorRefreshAccessToken") {
      signIn("keycloak"); // Force sign in to hopefully resolve error
    }
  }, [session]);
>>>>>>> 650d9e4 (🚧 feat: nextauth refreshtoken client side)
  return (
    <>
      <Link
        href="/dashboard/profile"
        sx={{ color: "white", marginRight: "10px" }}
      >
        <div>{name}</div>
      </Link>
      <Link href="#" sx={{ color: "white" }}>
        <Button
          aria-label="Log out"
          color="inherit"
          variant="outlined"
          onClick={() => {
            //keycloak logout then nextauth logout
<<<<<<< HEAD
<<<<<<< HEAD
            keycloakSessionLogOut();
=======
            keycloakSessionLogOut().then(() => signOut({ callbackUrl: "/" }));
>>>>>>> 280d666 (🚧 nextauth with keycloak provider)
=======
            keycloakSessionLogOut();
>>>>>>> 42b636c (🚧 nextauth SSO)
          }}
        >
          Log Out
        </Button>
      </Link>
    </>
  );
}
