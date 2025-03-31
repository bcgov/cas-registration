import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography, Link, Button } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import { FieldTemplateProps } from "@rjsf/utils";
import React from "react";
import LoopIcon from "@mui/icons-material/Loop";
import ErrorCircle from "@bciers/components/icons/ErrorCircle";

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

export const AddressErrorWidget = (props: any) => {
  const { value } = props;

  if (!value || value.trim() === "") return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mt: 0,
        mb: 1,
        bgcolor: "#EFDFDE",
        border: "1px solid #E6CDD1",
        borderRadius: 1.5,
        width: "100%",
      }}
      elevation={0}
    >
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <ErrorCircle />
        <Typography
          variant="body2"
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
          component="div"
        >
          <span dangerouslySetInnerHTML={{ __html: value }} />
        </Typography>
      </Box>
    </Paper>
  );
};
