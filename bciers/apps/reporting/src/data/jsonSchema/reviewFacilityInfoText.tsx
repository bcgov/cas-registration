import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link, Paper, Tooltip, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const infoNote = (operation_id: string, facility_id: string) => (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
          <span>
            <Link
              href={`/administration/operations/${operation_id}/facilities/${facility_id}?isNewTab=true`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "inherit",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Edit facility information
              <OpenInNewIcon
                fontSize="inherit"
                style={{ marginLeft: ".1rem" }}
              />
            </Link>{" "}
          </span>
        </Tooltip>
        and click the sync button to update and apply facility changes to all
        reports.
      </Typography>
    </Box>
  </Paper>
);
