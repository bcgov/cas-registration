import Check from "@bciers/components/icons/Check";
import { Box, Link, Paper, Typography } from "@mui/material";
import React from "react";

export const IssuanceStatusApprovedNote = () => {
  return (
    <Paper className="p-4 mb-[10px] bg-[#DCE9F6] text-bc-text">
      <Box className="flex items-center">
        <Check width={24} />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          Your request is approved. The earned credits have been issued to your
          holding account as identified below in the{" "}
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bc-link-blue underline decoration-[1.2px] font-bold"
          >
            B.C. Carbon Registry
          </Link>{" "}
          (BCCR) successfully.
        </Typography>
      </Box>
    </Paper>
  );
};
