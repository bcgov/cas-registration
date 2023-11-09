import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
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
  } catch (err) {
    console.error(err);
  }
}

export default function Profile({ name }: { readonly name: string }) {
  /* use the NextAuth useSession hook to get session data, and if a specific error condition is met,
     triggers a forced sign-in using the "keycloak" provider to potentially resolve the error related to refreshing access tokens.*/
  const { data: session } = useSession();
  // 👇️ run function whenever the session object changes e.g. session.error changes
  useEffect(() => {
    if (session?.error === "ErrorRefreshAccessToken") {
      signIn("keycloak"); // Force sign in to hopefully resolve error
    }
  }, [session]);
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
            keycloakSessionLogOut();
          }}
        >
          Log Out
        </Button>
      </Link>
    </>
  );
}
