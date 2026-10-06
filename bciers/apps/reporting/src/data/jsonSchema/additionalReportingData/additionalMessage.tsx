import { Typography } from "@mui/material";
import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles";
export const CapturedEmmissionsInfo = (
  <>
    <h2 className="inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 mb-6">
      Captured emissions (If applicable)
    </h2>
    <Typography
      className="text-[16px]"
      variant="body2"
      color={BC_GOV_BACKGROUND_COLOR_BLUE}
      fontStyle="italic"
    >
      Captured emissions means the emissions that otherwise would be released
      into the atmosphere, that is captured instead for further applications
      such as geological deposit and as an industrial material.
    </Typography>
  </>
);
