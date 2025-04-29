import { AlertIcon } from "@bciers/components/icons";
import { Box, Link, Paper, Typography } from "@mui/material";
import React from "react";

export const EarnedCreditsAlertNote = () => {
  return (
    <Paper
      className="p-[16px] mb-[10px] bg-[#DCE9F6] text-bc-text"
      data-testid="earned-credits-alert-note"
    >
      <Box className="flex items-center">
        <AlertIcon width="40" height="40" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          The earned credits have not been issued yet. You may request issuance
          of them as long as you have an active trading account in the{" "}
          <Link
            href="https://www.bc-ctr.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bc-link-blue underline decoration-[1.2px] font-bold"
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
