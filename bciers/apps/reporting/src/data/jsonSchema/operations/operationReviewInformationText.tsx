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
