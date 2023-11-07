import Button from "@mui/material/Button/Button";
import Link from "@mui/material/Link";
import { signOut } from "next-auth/react";

// 🛠️ Function to ensure keycloak session logout
async function keycloakSessionLogOut() {
  try {
    await fetch(`/api/auth/logout`, { method: "GET" });
  } catch (err) {
    console.error(err);
  }
}
export default function Profile({ name }: { name: string }) {
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
            keycloakSessionLogOut().then(() => signOut({ callbackUrl: "/" }));
          }}
        >
          Log Out
        </Button>
      </Link>
    </>
  );
}
