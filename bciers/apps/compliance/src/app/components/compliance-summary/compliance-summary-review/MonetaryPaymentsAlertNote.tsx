import { AlertIcon } from "@bciers/components/icons";
import { Box, Paper, Typography } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import React from "react";
export const MonetaryPaymentsAlertNote = () => {
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
        <AlertIcon width="20" height="20" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          You have not made any monetary payment yet.
        </Typography>
      </Box>
    </Paper>
  );
};
