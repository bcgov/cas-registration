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
          sx={{ ...commonButtonConfig }}
          aria-label="Program Administrator Log In"
          color="inherit"
          variant="outlined"
          onClick={() => signIn("keycloak")}
        >
          Program Administrator
          <br /> Log In
        </Button>
      </Link>
      <Link href="#" sx={{ color: "white" }}>
        <Button
          sx={{ ...commonButtonConfig, marginLeft: "20px" }}
          aria-label="Industrial Operator Log In"
          color="inherit"
          variant="outlined"
          onClick={() => signIn("keycloak")}
        >
          Industrial Operator
          <br /> Log In
        </Button>
      </Link>
    </>
  );
}
