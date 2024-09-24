import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
export const purposeNote = (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        The information shown on this page is data entered in registration. You
        can edit it here but it will only apply to this report. To make edits
        for all of your reports, please edit this information in registration.
      </Typography>
    </Box>
  </Paper>
);
