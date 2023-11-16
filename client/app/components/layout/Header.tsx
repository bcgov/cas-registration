"use client";
// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import Session from "@/app/components/navigation/Session";

export default function Header() {
  // 🖥️📲  using MUI theme breakpoints for responsive design https://mui.com/material-ui/customization/breakpoints/

  // 🧩 For authentication content using theme breakpoints to hide for mobile & tablet
  const ButtonsRight = styled(Box)(({ theme }) => ({
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  }));
  // 🧩 For authentication content using theme breakpoints to hide for laptop & desktop
  const ButtonsBottom = styled(Toolbar)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  }));

  return (
    <AppBar
      color="primary"
      sx={{
        width: "100%",
        justifyContent: "center",
        position: "absolute",
        backgroundColor: "primary.main",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Box
        position="relative"
        color="primary"
        sx={{
          margin: "0 auto",
          clipPath: "inset(-5px 0px -5px 0px)",
          boxSize: "border-box",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1536px",
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
          {/* 👇️ Authentication content for laptop & desktop */}
          <ButtonsRight>
            <Session />
          </ButtonsRight>
        </Toolbar>
        {/* 👇️ Authentication content for mobile & tablet */}
        <ButtonsBottom>
          <Session />
        </ButtonsBottom>
      </Box>
    </AppBar>
  );
}
