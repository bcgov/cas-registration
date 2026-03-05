import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
export const NonAttributableEmmissionsInfo = (
  <>
    <Typography
      variant="body2"
      color={BC_GOV_BACKGROUND_COLOR_BLUE}
      fontStyle="italic"
      fontSize={16}
    >
      Report activities for which the facility emissions exceed 100 t CO2e and
      are not captured by one of the reportable activities.
    </Typography>
  </>
);
