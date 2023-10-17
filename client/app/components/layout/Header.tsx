"use client";

import { useRouter } from "next/navigation";

// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

// 🧭 using MUI theme breakpoints for responsive design https://mui.com/material-ui/customization/breakpoints/
export default function Header() {
  // 🛸 Routing
  const router = useRouter();

  // 🧩 For login buttons using theme breakpoints to hide for mobile & tablet
  const ButtonsRight = styled(Box)(({ theme }) => ({
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  }));

  // 🧩 For login buttons using theme breakpoints to hide for laptop & desktop
  const ButtonsBottom = styled(Toolbar)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  }));

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
    <AppBar
      position="static"
      color="primary"
      sx={{
        height: {
          xs: "150px", //mobile & tablet
          md: "80px", //laptop & desktop
        },
      }}
    >
      <Toolbar>
        <Box
          component="img"
          sx={{
            height: {
              xs: "36.46px", //mobile & tablet
              md: "42.67px", //laptop & desktop
            },
            width: {
              xs: "170px", //mobile & tablet
              md: "200px", //laptop & desktop
            },
          }}
          alt="Logo for Province of British Columbia CleanBC"
          src="/img/BCID_CleanBC_rev_tagline_colour.svg"
          aria-label="CleanBC Logo"
        />
        <Typography
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: {
              xs: "20px", //mobile & tablet
              md: "28px", //laptop & desktop
            },
            lineHeight: {
              xs: "24.2px", //mobile & tablet
              md: "33.89px", //laptop & desktop
            },
            marginLeft: "24px",
          }}
        >
          BC OBPS
        </Typography>
        {/* navigation content for laptop & desktop*/}
        <ButtonsRight>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ ...commonButtonConfig }}
            onClick={() => router.push("/auth/signin")}
            aria-label="Program Administrator Log In"
          >
            Program Administrator
            <br /> Log In
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ ...commonButtonConfig, marginLeft: "20px" }}
            onClick={() => router.push("/auth/signin")}
            aria-label="Industrial Operator Log In"
          >
            Industrial Operator
            <br /> Log In
          </Button>
        </ButtonsRight>
        {/* navigation content for mobile & tablet*/}
      </Toolbar>
      <ButtonsBottom>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ ...commonButtonConfig }}
          onClick={() => router.push("/auth/signin")}
          aria-label="Program Administrator Log In"
        >
          Program Administrator
          <br /> Log In
        </Button>
        <Button
          color="inherit"
          variant="outlined"
          sx={{ ...commonButtonConfig, marginLeft: "20px" }}
          onClick={() => router.push("/auth/signin")}
          aria-label="Industrial Operator Log In"
        >
          Industrial Operator
          <br /> Log In
        </Button>
      </ButtonsBottom>
    </AppBar>
  );
}
