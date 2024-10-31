import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
export const newEntrantInfo = (
  <>
    <Typography
      variant="body2"
      color={BC_GOV_BACKGROUND_COLOR_BLUE}
      fontStyle="italic"
      fontSize={16}
    >
      This section applies to operations that fall under{" "}
      <u>new entrant category</u>.
    </Typography>
  </>
);
