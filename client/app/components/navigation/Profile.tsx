import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
import { signIn, signOut, useSession } from "next-auth/react";
import { getUserFullName } from "@/app/utils/getUserFullName";
import { useEffect } from "react";

import { getEnvValue } from "@/app/utils/actions";
export default function Profile() {
  /* use the NextAuth useSession hook to get session data, and if a specific error condition is met,
     triggers a forced sign-in using the "keycloak" provider to potentially resolve the error related to refreshing access tokens.*/
  const { data: session } = useSession();

  const name = getUserFullName(session);
  // 👇️ run function whenever the session object changes e.g. session.error changes
  useEffect(() => {
    if (session?.error === "ErrorAccessToken") {
      signIn("keycloak"); // Force sign in to hopefully resolve error
    }
  }, [session]);

  return (
    <div className="flex items-center">
      <Link
        data-testid="nav-user-profile"
        href="/dashboard/profile"
        sx={{ color: "white", marginRight: "10px" }}
      >
        <div className="font-bold text-lg underline">{name}</div>
      </Link>
      <Link href="#" sx={{ color: "white", marginLeft: "8px" }}>
        <Button
          aria-label="Log out"
          color="inherit"
          variant="text"
          className="text-lg"
          onClick={async () => {
            const url = await getEnvValue("SITEMINDER_KEYCLOAK_LOGOUT_URL");
            await signOut({
              callbackUrl: url,
            });
          }}
        >
          Log Out
        </Button>
      </Link>
    </div>
  );
}
