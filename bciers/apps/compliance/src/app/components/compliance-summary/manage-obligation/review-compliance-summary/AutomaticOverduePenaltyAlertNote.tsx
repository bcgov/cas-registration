import { AlertIcon } from "@bciers/components/icons";
import { Box, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const AutomaticOverduePenaltyAlertNote = () => {
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
        <AlertIcon width="28" height="28" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          The automatic administrative penalty will continue accruing until the
          compliance obligation is fully met. Once fully met, you will receive
          the final administrative penalty invoice.
        </Typography>
      </Box>
    </Paper>
  );
};
