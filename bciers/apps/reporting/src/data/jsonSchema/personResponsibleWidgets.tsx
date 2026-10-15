import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Paper, Typography, Link, Button, Tooltip } from "@mui/material";
import { FieldTemplateProps } from "@rjsf/utils";
import React from "react";
import LoopIcon from "@mui/icons-material/Loop";
import ErrorCircle from "@bciers/components/icons/ErrorCircle";

export const infoNote = (
  <Paper className="p-4 mb-6 bg-bc-light-blue text-bc-text">
    <Box className="flex items-center">
      <InfoIcon className="mr-2" />
      <Typography variant="body2">
        See that information is incorrect or need to add a new contact? Update
        it here in{" "}
        <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
          <Link
            href="/administration/contacts?isNewTab=true"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bc-link-blue no-underline inline-flex items-center"
          >
            Contacts
            <OpenInNewIcon fontSize="inherit" className="ml-[0.1rem]" />.
          </Link>
        </Tooltip>
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
      className="p-3 mt-0 mb-2 bg-[#EFDFDE] border border-[#E6CDD1] rounded-md w-full"
      elevation={0}
    >
      <Box className="flex items-center w-full">
        <ErrorCircle />
        <Typography
          variant="body2"
          className="w-full flex items-center"
          component="div"
        >
          <span dangerouslySetInnerHTML={{ __html: value }} />
        </Typography>
      </Box>
    </Paper>
  );
};
