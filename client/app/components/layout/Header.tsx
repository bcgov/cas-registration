"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 🏷 import {named} can be significantly slower than import default
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Menu from "@mui/material/Menu/Menu";
import MenuIcon from "@mui/icons-material/Menu";

// 🧭 using MUI theme breakpoints for responsive design https://mui.com/material-ui/customization/breakpoints/
export default function Header() {
  // 🛸 Routing
  const router = useRouter();

  // 🧩 box for buttons using theme breakpoints to hide for mobile & tablet
  const Buttons = styled(Box)(({ theme }) => ({
    display: "none",
    alignItems: "center",
    gap: "20px",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  }));

  // 🧩 box for icons using theme breakpoints to hide for laptop & desktop
  const Icons = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    [theme.breakpoints.up("md")]: {
      display: "none",
    },
  }));

  // 🧪 state management for mobile & tablet Menu display using MoreMenu icon
  const [open, setOpen] = useState(false);

  return (
    <AppBar
      position="static"
      color="primary"
      sx={{
        height: {
          xs: "60px", //mobile & tablet
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
        <Buttons>
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
        </Buttons>
        {/* navigation content for mobile & tablet*/}
        <Icons>
          <MenuIcon fontSize="large" onClick={() => setOpen(true)} />
        </Icons>
      </Toolbar>
      {/* navigation menu for mobile & tablet*/}
      <Menu
        id="mobile-more-menu"
        aria-labelledby="mobile-more-menu"
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => router.push("/auth/signin")}
          role="menuitem"
          aria-label="Go to Program Administrator Log In"
          tabIndex={0}
        >
          Program Administrator Log In
        </MenuItem>
        <MenuItem
          onClick={() => router.push("/auth/signin")}
          role="menuitem"
          aria-label="Go to Industrial Operator Log In"
          tabIndex={1}
        >
          Industrial Operator Log In
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
