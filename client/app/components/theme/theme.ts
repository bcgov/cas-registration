import { createTheme } from "@mui/material/styles";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
} from "@/app/styles/colors";
import "@bcgov/bc-sans/css/BCSans.css";

const theme = createTheme({
  typography: {
    fontFamily: "BCSans, sans-serif",
    // Include "sans-serif" as a fallback font family.
  },
  // To modify each color directly, provide an object with one or more of the color tokens. Only the main token is required; light, dark, and contrastText are optional, and if not provided, then their values are calculated
  palette: {
    primary: {
      main: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
      // light: will be calculated from palette.primary.main,
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#E0C2FF",
      light: "#F5EBFF",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#47008F",
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
  },
});

export default theme;
