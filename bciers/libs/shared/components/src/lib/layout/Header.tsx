"use client";
// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import Profile from "@bciers/components/navigation/Profile";

import Logo from "@bciers/img/src/lib/BCID_CleanBC_rev_tagline_colour.svg";

export default function Header() {
  const { data: session } = useSession();

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
    justifyContent: "flex-start",
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
        height: {
          xs: "150px", //mobile & tablet
          md: "80px", //laptop & desktop
        },
      }}
    >
      <Box
        position="relative"
        color="primary"
        sx={{
          margin: "0 auto",
          boxSize: "border-box",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1536px",
        }}
      >
        <Toolbar>
          <Link href="/" passHref>
            <Image
              src={Logo}
              alt="Logo for Province of British Columbia CleanBC"
              width="200"
              height="43"
            />
          </Link>
          <Typography
            component="h1"
            color="white"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: {
                // Reduce font size for mobile & tablet since lengthy title was breaking mobile views
                xs: "12px", //mobile & tablet
                sm: "20px", //mobile & tablet
                md: "28px", //laptop & desktop
              },
              lineHeight: {
                xs: "24.2px", //mobile & tablet
                md: "33.89px", //laptop & desktop
              },
              padding: {
                xs: "4px",
                md: "0px",
              },
              marginLeft: "24px",
              cursor: "default",
            }}
          >
            B.C. Industrial Emissions Reporting System (BCIERS)
          </Typography>
          {/* 👇️ Authentication content for laptop & desktop */}
          {session && (
            <ButtonsRight>
              <Profile />
            </ButtonsRight>
          )}
        </Toolbar>
        {/* 👇️ Authentication content for mobile & tablet */}
        {session && (
          <ButtonsBottom>
            <Profile />
          </ButtonsBottom>
        )}
      </Box>
    </AppBar>
  );
}
