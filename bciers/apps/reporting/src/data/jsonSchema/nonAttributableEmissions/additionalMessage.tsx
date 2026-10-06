import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
export const NonAttributableEmmissionsInfo = (
  <>
    <Typography
      className="text-[16px]"
      variant="body2"
      color={BC_GOV_BACKGROUND_COLOR_BLUE}
      fontStyle="italic"
    >
      Report activities for which the facility emissions exceed 100 t CO2e and
      are not captured by one of the reportable activities.
    </Typography>
  </>
);
