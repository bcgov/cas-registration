import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Paper, Typography, Button, Link, Tooltip } from "@mui/material";
import { FieldTemplateProps } from "@rjsf/utils";
import React from "react";
import LoopIcon from "@mui/icons-material/Loop";

export const getInfoNote = (operationId: string) => (
  <Paper className="p-4 mb-6 bg-bc-light-blue text-bc-text">
    <Box className="flex items-center">
      <InfoIcon className="mr-2" />
      <Typography variant="body2">
        Linear Facilities Operations must register and report for all large and
        medium facilities, as well as a small aggregate, if applicable.{" "}
        <b>Don’t see a facility?</b>{" "}
        <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
          <span>
            <Link
              href={`/administration/operations/${operationId}/facilities/add-facility?isNewTab=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline inline-flex items-center"
            >
              <u>Add it here</u>
              <OpenInNewIcon fontSize="inherit" className="ml-[0.1rem]" />
            </Link>{" "}
          </span>
        </Tooltip>
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
