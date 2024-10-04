"use client";

import { createTheme } from "@mui/material/styles";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_GREY,
  BC_GOV_COMPONENTS_GREY,
  BC_GOV_LINKS_COLOR,
  BC_GOV_YELLOW,
  BC_GOV_TEXT,
  LIGHT_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
  BC_GOV_SEMANTICS_GREEN,
  DARK_GREY_BG_COLOR,
  WHITE,
} from "@bciers/styles";
import "@bcgov/bc-sans/css/BCSans.css";
export const theme = createTheme({
  typography: {
    fontFamily: "BCSans, sans-serif",
    // Include "sans-serif" as a fallback font family.
    allVariants: {
      color: BC_GOV_TEXT,
    },
  },
  // To modify each color directly, provide an object with one or more of the color tokens. Only the main token is required; light, dark, and contrastText are optional, and if not provided, then their values are calculated
  palette: {
    primary: {
      main: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
      light: BC_GOV_BACKGROUND_COLOR_BLUE,
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: DARK_GREY_BG_COLOR,
      light: LIGHT_GREY_BG_COLOR,
    },
    error: {
      main: BC_GOV_SEMANTICS_RED,
    },
    warning: {
      main: BC_GOV_YELLOW,
    },
    success: {
      main: BC_GOV_SEMANTICS_GREEN,
    },
    text: {
      primary: BC_GOV_TEXT,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          textTransform: "capitalize",
          backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
        },
        text: {
          backgroundColor: "transparent",
        },
        outlined: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "& a": {
            color: BC_GOV_LINKS_COLOR,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: WHITE,
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: BC_GOV_LINKS_COLOR,
            },
            "&.Mui-focused fieldset": {
              borderColor: BC_GOV_LINKS_COLOR,
            },
          },
          "& .Mui-disabled": {
            backgroundColor: BC_GOV_BACKGROUND_COLOR_GREY,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: WHITE,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: BC_GOV_LINKS_COLOR,
            borderWidth: "1px",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: BC_GOV_LINKS_COLOR,
          },
          "& .Mui-disabled": {
            backgroundColor: BC_GOV_BACKGROUND_COLOR_GREY,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: DARK_GREY_BG_COLOR,
            },
            "&:hover fieldset": {
              borderColor: BC_GOV_LINKS_COLOR,
            },
            "&.Mui-focused fieldset": {
              borderColor: BC_GOV_LINKS_COLOR,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorSecondary: {
          color: BC_GOV_COMPONENTS_GREY,
          borderColor: BC_GOV_COMPONENTS_GREY,
        },
        colorInfo: {
          color: BC_GOV_LINKS_COLOR,
          borderColor: BC_GOV_LINKS_COLOR,
        },
        root: {
          // disabled styles
          "&.Mui-disabled": {
            border: `1px solid ${BC_GOV_COMPONENTS_GREY}`,
          },
          ".MuiChip-deleteIcon": {
            display: "none",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
          minHeight: "40px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          paddingTop: "4px",
          paddingBottom: "4px",
          "& .MuiListItemText-primary": {
            fontSize: "0.8rem",
          },
          "&.Mui-selected": {
            color: BC_GOV_LINKS_COLOR,
            borderRight: `2px solid ${BC_GOV_LINKS_COLOR}`,
            "& .MuiListItemText-primary": {
              color: BC_GOV_LINKS_COLOR,
            },
          },
        },
      },
    },
  },
});
