"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Header() {
  const router = useRouter();

  return (
    <AppBar
      color="primary"
      sx={{
        height: "80px",
      }}
    >
      <Toolbar
        sx={{
          marginLeft: "78px",
        }}
      >
        <Image
          alt="Logo for Province of British Columbia CleanBC"
          src="/img/BCID_CleanBC_rev_tagline_colour.svg"
          height={42.67}
          width={200}
          style={{ marginTop: "18px" }}
          aria-label="CleanBC Logo"
        />
        <Typography
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: "28px",
            lineHeight: "33.89px",
            marginTop: "22px",
            marginLeft: "24px",
          }}
        >
          BC OBPS
        </Typography>
        <Button
          color="inherit"
          variant="outlined"
          sx={{
            width: "160px",
            height: "60px",
            marginTop: "10px",
            fontWeight: 700,
            fontSize: "12px",
            lineHeight: "14.52px",
            textAlign: "center",
            padding: 0,
          }}
          onClick={() => router.push("/auth/signin")}
          aria-label="Program Administrator Log In"
        >
          Program Administrator
          <br /> Log In
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{
            width: "160px",
            height: "60px",
            marginTop: "10px",
            fontWeight: 700,
            fontSize: "12px",
            lineHeight: "14.52px",
            textAlign: "center",
            padding: 0,
            marginLeft: "20px",
          }}
          onClick={() => router.push("/auth/signin")}
          aria-label="Industrial Operator Log In"
        >
          Industrial Operator
          <br /> Log In
        </Button>
      </Toolbar>
    </AppBar>
  );
}
