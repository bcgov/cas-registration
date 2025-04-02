import InfoIcon from "@mui/icons-material/Info";
import { Box, Link, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const purposeNote = (
  operationId: string = "",
  operationName: string = "",
) => (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        Any edits to operation information made here will only apply to this
        report. You can{" "}
        <Link
          href={`/administration/operations/${operationId}?operations_title=${operationName}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          update operation information
        </Link>{" "}
        in the operations page.
      </Typography>
    </Box>
  </Paper>
);

export const reportTypeHelperText =
  "Simple Reports are submitted by reporting operations that previously emitted greater than or equal to 10 000 tCO2e of attributable emissions in a reporting period, but now emit under 10 000 tCO2e of attributable emissions and have an obligation to continue reporting emissions for three consecutive reporting periods. This report type is not applicable for any operations that received third party verification in the immediately preceding reporting period, and is not applicable for opted-in operations.";
