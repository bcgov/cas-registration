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
        Linear Facilities Operations must register and report for all{" "}
        <Link
          href="TODO"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          large
        </Link>
        and{" "}
        <Link
          href="TODO"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          medium facilities
        </Link>
        , as well as{" "}
        <Link
          href="TODO"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          small aggregate
        </Link>
        , if applicable. <b>Don&apos;t see a facility?</b>{" "}
        <Link
          href="TODO"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Add it under Facilities Information
        </Link>{" "}
        and click on the &apos;Sync latest data from Administration&apos; button
        below to update the list.
      </Typography>
    </Box>
  </Paper>
);

export const instructionNote = (
    <Typography variant="subtitle1">Select the facilities that apply to your operation, prior to Dec 31 of the current reporting year.</Typography>
);

export const SyncFacilitiesButton: React.FC<FieldTemplateProps> = ({
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
      aria-label="Sync latest data from Administration"
    >
      <LoopIcon /> Sync latest data from Administration
    </Button>
  );
};
