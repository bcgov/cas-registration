import { AlertIcon } from "@bciers/components/icons";
import { Box, Link, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const ComplianceUnitsAlertNote = () => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: "10px",
        bgcolor: LIGHT_BLUE_BG_COLOR,
        color: BC_GOV_TEXT,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <AlertIcon width="35" height="35" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          You may use compliance units (earned credits, offset units) you hold
          in the
          <Link
            href="/administration"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            {" "}
            B.C. Carbon Registry (BCCR){" "}
          </Link>
          to meet up to 50% of the compliance obligation below. The remaining
          balance must be met with monetary payment(s).{" "}
        </Typography>
      </Box>
    </Paper>
  );
};
