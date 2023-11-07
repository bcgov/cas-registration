import { createTheme } from "@mui/material/styles";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
  BC_GOV_BACKGROUND_COLOR_BLUE,
  LIGHT_GREY_BG_COLOR,
} from "@/app/styles/colors";
import "@bcgov/bc-sans/css/BCSans.css";
console.log("BC_GOV_BACKGROUND_COLOR_BLUE", BC_GOV_BACKGROUND_COLOR_BLUE);

const theme = createTheme({
  typography: {
    fontFamily: "BCSans, sans-serif",
    // Include "sans-serif" as a fallback font family.
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
      main: BC_GOV_BACKGROUND_COLOR_BLUE,
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

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: LIGHT_GREY_BG_COLOR,
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
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: LIGHT_GREY_BG_COLOR,
          },
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
              borderColor: LIGHT_GREY_BG_COLOR,
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
