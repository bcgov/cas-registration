import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link, Paper, Tooltip, Typography } from "@mui/material";
export const infoNote = (operation_id: string, facility_id: string) => (
  <Paper className="p-4 mb-6 bg-bc-light-blue text-bc-text">
    <Box className="flex items-center">
      <InfoIcon className="mr-2" />
      <Typography variant="body2">
        <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
          <span>
            <Link
              href={`/administration/operations/${operation_id}/facilities/${facility_id}?isNewTab=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline inline-flex items-center"
            >
              Edit facility information
              <OpenInNewIcon fontSize="inherit" className="ml-[0.1rem]" />
            </Link>{" "}
          </span>
        </Tooltip>
        and click the sync button to update and apply facility changes to all
        reports.
      </Typography>
    </Box>
  </Paper>
);
