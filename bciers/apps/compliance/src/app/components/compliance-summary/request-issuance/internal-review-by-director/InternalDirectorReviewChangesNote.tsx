import { Box, Paper, Typography } from "@mui/material";
import React from "react";
import AlertIcon from "@bciers/components/icons/AlertIcon";

export const InternalDirectorReviewChangesNote = () => {
  return (
    <Paper className="p-4 mb-[10px] bg-[#DCE9F6] text-bc-text">
      <Box className="flex items-center">
        <AlertIcon />
        <Typography className="ml-[10px] text-[16px]" variant="body2">
          Changes were required in the previous step. You may not decline or
          approve the request until the supplementary report is submitted and
          the earned credits are adjusted accordingly.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InternalDirectorReviewChangesNote;
