import InfoIcon from "@mui/icons-material/Info";
import { Box, Link, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const purposeNote = (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        The information shown on this page is data entered in Administration.
        You can edit Operation Information here but it will only apply to this
        report. To apply Operation information edits to all of your reports,
        please edit this information in{" "}
        <Link
          href="/administration"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Administration.
        </Link>
      </Typography>
    </Box>
  </Paper>
);

export const reportTypeHelperText =
  "Simple Reports are submitted by reporting operations that previously emitted greater than or equal to 10 000 tCO2e of attributable emissions in a reporting period, but now emit under 10 000 tCO2e of attributable emissions and have an obligation to continue reporting emissions for three consecutive reporting periods. This report type is not applicable for any operations that received third party verification in the immediately preceding reporting period, and is not applicable for opted-in operations.";
