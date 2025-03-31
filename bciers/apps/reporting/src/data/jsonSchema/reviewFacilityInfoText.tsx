import InfoIcon from "@mui/icons-material/Info";
import { Box, Link, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const infoNote = (operation_id: string, facility_id: string) => (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        <Link
          href={`/administration/operations/${operation_id}/facilities/${facility_id}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Edit facility information
        </Link>{" "}
        and click the sync button to update and apply facility changes to all
        reports.
      </Typography>
    </Box>
  </Paper>
);
