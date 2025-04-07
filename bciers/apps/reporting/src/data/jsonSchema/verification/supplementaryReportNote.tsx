import { Box, Link, Typography } from "@mui/material";
import React from "react";
export const infoNote = () => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <Typography variant="body2">
      <strong>Note:</strong> If you are submitting an updated report to correct
      an error in a previous report, and were required to have this updated
      report verified, then you must upload a new verification statement in the
      attachments page. For guidance on whether verification is required, please
      refer to the{" "}
      <Link
        href={
          " https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/reporting/verify"
        }
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: "inherit", textDecoration: "none" }}
      >
        verification guidance webpage.
      </Link>
    </Typography>
  </Box>
);
