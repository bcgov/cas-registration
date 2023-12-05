import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
import { keycloakSessionLogOut } from "@/app/utils/auth/actions";

export default function Profile({ name }: { readonly name: string }) {
  return (
    <div className="flex items-center">
      <Link
        data-testid="profile-nav-user"
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
          onClick={() => {
            //keycloak logout then nextauth logout
            keycloakSessionLogOut();
          }}
        >
          Log Out
        </Button>
      </Link>
    </div>
  );
}
