import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import { signIn } from "next-auth/react";

export default function Login() {
  // 🧩common button config
  const commonButtonConfig = {
    width: "160px",
    height: "60px",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "14.52px",
    textAlign: "center",
    padding: 0,
  };

  return (
    <>
      <Link href="#" sx={{ color: "white" }}>
        <Button
          data-testid="login-cas"
          sx={{ ...commonButtonConfig }}
          aria-label="Program Administrator Log In"
          color="inherit"
          variant="outlined"
          onClick={() => signIn("keycloak", undefined, { kc_idp_hint: "idir" })}
        >
          Program Administrator
          <br /> Log In
        </Button>
      </Link>
      <Link href="#" sx={{ color: "white" }}>
        <Button
          data-testid="login-io"
          sx={{ ...commonButtonConfig, marginLeft: "20px" }}
          aria-label="Industrial Operator Log In"
          color="inherit"
          variant="outlined"
          onClick={() =>
            signIn("keycloak", undefined, { kc_idp_hint: "bceidbusiness" })
          }
        >
          Industrial Operator
          <br /> Log In
        </Button>
      </Link>
    </>
  );
}
