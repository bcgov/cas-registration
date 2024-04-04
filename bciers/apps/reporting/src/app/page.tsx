"use client";

import { Button, Grid } from "@mui/material";
import { signIn } from "next-auth/react";
import { Main } from "@bciers/components/server";
import Logo from "@bciers/img/src/lib/BCID_CleanBC_rev_tagline_colour.svg";
import Image from "next/image";

export default function Index() {
  const handleIdirLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "idir" });
  };

  return (
    <Main>
      <Image src={Logo} alt="testing" width="200" height="43" />
      <Grid
        container
        spacing={2}
        sx={{
          marginTop: "24px",
          marginBottom: "48px",
        }}
      >
        <Button
          variant="outlined"
          className="w-full md:max-w-[70%]"
          onClick={handleIdirLogin}
        >
          Log in with IDIR
        </Button>
      </Grid>
    </Main>
  );
}
