"use client";

import { usePathname, useRouter } from "next/navigation";
import Login from "@/app/components/navigation/Login";
import Profile from "@/app/components/navigation/Profile";

// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";

export default function Header() {
  //🧪 ************ Mock authentication state ***********************
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // `usePathname` hook from next/navigation to access the current route information
  const path = usePathname();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDashboardPage = path.includes("/dashboard");
      setIsAuthenticated(isDashboardPage);
    }
  });

  // 🖥️📲  using MUI theme breakpoints for responsive design https://mui.com/material-ui/customization/breakpoints/
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

        {/*📛 To do: use authentication session info to show/hide login buttons*/}
        {isAuthenticated ? (
          <Profile />
        ) : (
          // Login navigation content for laptop & desktop*
          <ButtonsRight>
            <Login />
          </ButtonsRight>
        )}
      </Toolbar>
      {/*📛 To do: use authentication session info to show/hide login buttons*/}
      {!isAuthenticated && (
        // Login navigation content for mobile & tablet*
        <ButtonsBottom>
          <Login />
        </ButtonsBottom>
      )}
    </AppBar>
  );
}
