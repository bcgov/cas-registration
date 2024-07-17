"use client";

import { Button, Grid } from "@mui/material";
import { signIn } from "next-auth/react";
import Main from "@bciers/components/layout/Main";
// eslint-disable-next-line import/extensions
import Logo from "@bciers/img/src/BCID_CleanBC_rev_tagline_colour.svg";
import Image from "next/image";

export default function Index() {
  const handleIdirLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "idir" });
  };

  const handleBceidLogin = () => {
    signIn("keycloak", undefined, { kc_idp_hint: "bceidbusiness" });
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
        <div></div>
        <Button
          variant="outlined"
          className="w-full md:max-w-[70%]"
          onClick={handleBceidLogin}
        >
          Log in with Business BCeID
        </Button>
      </Grid>
    </Main>
  );
}
