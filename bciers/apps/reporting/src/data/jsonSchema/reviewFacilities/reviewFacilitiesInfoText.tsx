import InfoIcon from "@mui/icons-material/Info";
import { Box, Paper, Typography, Button, Link } from "@mui/material";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import { FieldTemplateProps } from "@rjsf/utils";
import React from "react";
import LoopIcon from "@mui/icons-material/Loop";

export const getInfoNote = (operationId: string) => (
  <Paper sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}>
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <InfoIcon sx={{ mr: 1 }} />
      <Typography variant="body2">
        Linear Facilities Operations must register and report for all large and
        medium facilities, as well as a small aggregate, if applicable.{" "}
        <b>Don’t see a facility?</b>{" "}
        <Link
          href={`/administration/operations/${operationId}/facilities/add-facility`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          <u>Add it here</u>
        </Link>{" "}
        and then click on the ‘Sync latest data from Administration’ button to
        update this list of facilities.
      </Typography>
    </Box>
  </Paper>
);

export const instructionNote = (
  <Typography variant="subtitle2" color="primary">
    <i>
      Select the facilities that apply to your operation, prior to Dec 31 of the
      current reporting year period
    </i>
  </Typography>
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
      className={"mt-5 mb-5"}
      variant="outlined"
      onClick={handleClick}
      aria-label="Sync latest data from Administration"
    >
      <LoopIcon /> Sync latest data from Administration
    </Button>
  );
};
