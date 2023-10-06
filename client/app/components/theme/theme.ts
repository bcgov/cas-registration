import { createTheme } from "@mui/material/styles";
import {
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
} from "@/app/styles/colors";

const theme = createTheme({
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
