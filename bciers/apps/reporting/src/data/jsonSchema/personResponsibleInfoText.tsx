import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography, Link, Button } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import { FieldTemplateProps } from "@rjsf/utils";
import React from "react";
import LoopIcon from "@mui/icons-material/Loop";

export const infoNote = (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        See that information is incorrect or need to add a new contact? Update
        it here in{" "}
        <Link
          href="/administration/contacts"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Contacts.
        </Link>
      </Typography>
    </Box>
  </Paper>
);

export const SyncContactsButton: React.FC<FieldTemplateProps> = ({
  uiSchema,
}) => {
  const onSync = uiSchema?.["ui:options"]?.onSync;

  const handleClick = () => {
    if (typeof onSync === "function") {
      onSync();
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClick}
      aria-label="Sync latest data from registration"
    >
      <LoopIcon /> Sync latest data from registration
    </Button>
  );
};
