import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography } from "@mui/material";
export const purposeNote = (
  <Paper sx={{ p: 2, mb: 3, bgcolor: "#DCE9F6", color: "#313132" }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        The information shown on this page is data entered in registration. You
        can edit it here but it will only apply to this report. To make edits
        for all of your reports, please edit this information in registration.
      </Typography>
    </Box>
  </Paper>
);

export const dateInfo = (
  <Typography variant="body2" color="#38598A" fontSize="16px" gutterBottom>
    Please ensure this information was accurate for{" "}
    <b>
      <u>Dec 31 2024</u>
    </b>
  </Typography>
);
