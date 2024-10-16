import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography, Link } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";

export const infoNote = (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        See that information is incorrect or need to add a new contact? Update
        it here in{" "}
        <Link
          href="/administration/contacts"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Contacts.
        </Link>
      </Typography>
    </Box>
  </Paper>
);
