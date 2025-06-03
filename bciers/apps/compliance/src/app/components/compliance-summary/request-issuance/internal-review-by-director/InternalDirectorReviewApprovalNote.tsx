import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const InternalDirectorReviewApprovalNote = () => {
  return (
    <Paper className="p-4 mb-[10px] bg-[#DCE9F6] text-bc-text">
      <Box className="flex items-center">
        <AlertIcon />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          Once the issuance request is approved, the earned credits will be
          issued to the holding account as identified above in B.C. Carbon
          Registry.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InternalDirectorReviewApprovalNote;
