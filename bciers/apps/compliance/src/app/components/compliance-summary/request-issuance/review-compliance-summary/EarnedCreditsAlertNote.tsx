import { AlertIcon } from "@bciers/components/icons";
import { Box, Link, Paper, Typography } from "@mui/material";
import {
  BC_GOV_LINKS_COLOR,
  BC_GOV_TEXT,
  LIGHT_BLUE_BG_COLOR,
} from "@bciers/styles";
import React from "react";

export const EarnedCreditsAlertNote = () => {
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
        <AlertIcon width="40" height="40" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          The earned credits have not been issued yet. You may request issuance
          of them as long as you have an active trading account in the{" "}
          <Link
            href="https://www.bc-ctr.ca/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: BC_GOV_LINKS_COLOR,
              textDecoration: "underline",
              textDecorationThickness: "1.2px",
              fontWeight: "bold",
            }}
          >
            B.C. Carbon Registrys
          </Link>{" "}
          (BCCR). Once issued, you may trade or use them to meet your compliance
          obligation.
        </Typography>
      </Box>
    </Paper>
  );
};
