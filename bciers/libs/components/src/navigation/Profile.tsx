import { signOut, useSession } from "next-auth/react";
import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
import { getEnvValue } from "@bciers/actions";
import getUserFullName from "@bciers/utils/getUserFullName";

export default function Profile() {
  const { data: session } = useSession();
  const userFullName = getUserFullName(session);
  return (
    <div className="flex items-center">
      <Link
        data-testid="nav-user-profile"
        href="/administration/profile"
        sx={{ color: "white", marginRight: "10px" }}
      >
        <div
          data-testid={`${session?.user?.app_role}`}
          className="font-bold text-lg underline"
        >
          {userFullName}
        </div>
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
