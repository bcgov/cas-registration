import { TimeIcon } from "@bciers/components/icons";
import { Box, Link, Paper, Typography } from "@mui/material";
import { BC_GOV_YELLOW } from "@bciers/styles";
import React from "react";

export const IssuanceStatusAwaitingNote = () => {
  return (
    <Paper className="p-4 mb-[10px] bg-[#DCE9F6] text-bc-text">
      <Box className="flex items-center">
        <TimeIcon fill={BC_GOV_YELLOW} width="32" height="32" />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          Your request has been submitted successfully. Once your request is
          approved, the earned credits will be issued to your holding account as
          identified below in the{" "}
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bc-link-blue underline decoration-[1.2px] font-bold"
          >
            B.C. Carbon Registry
          </Link>{" "}
          (BCCR).
        </Typography>
      </Box>
    </Paper>
  );
};
