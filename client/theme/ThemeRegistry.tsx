"use client";

import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeOptions, ThemeProvider } from "@mui/material/styles";
import { NextAppDirEmotionCacheProvider } from "./EmotionCache";
import { BC_GOV_PRIMARY_BRAND_COLOR_BLUE } from "@/app/lib/colors";
import typography from "./Typography";
import GovTypography from "./Typography";
import "@bcgov/bc-sans/css/BCSans.css";

const themeOptions: ThemeOptions = {
  typography: {
    fontFamily: "BCSans",
  },
  palette: {
    primary: {
      main: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          textTransform: "capitalize",
        },
      },
    },
  },
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
