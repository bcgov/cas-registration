import { createTheme } from "@mui/material/styles";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_COMPONENTS_GREY,
  BC_GOV_LINKS_COLOR,
  BC_GOV_YELLOW,
  BC_GOV_TEXT,
  LIGHT_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
  BC_GOV_SEMANTICS_GREEN,
  DARK_GREY_BG_COLOR,
} from "@/app/styles/colors";
import "@bcgov/bc-sans/css/BCSans.css";

const theme = createTheme({
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
          "& .MuiOutlinedInput-root": {
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
    MuiSelect: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: BC_GOV_LINKS_COLOR,
            borderWidth: "1px",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: BC_GOV_LINKS_COLOR,
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
      },
    },
  },
});

export default theme;
