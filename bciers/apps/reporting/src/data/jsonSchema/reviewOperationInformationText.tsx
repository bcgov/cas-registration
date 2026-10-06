import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Link, Paper, Tooltip, Typography } from "@mui/material";
export const purposeNote = (
  operationId: string = "",
  operationName: string = "",
) => (
  <Paper className="p-4 mb-6 bg-bc-light-blue text-bc-text">
    <Box className="flex items-center">
      <InfoIcon className="mr-2" />
      <Typography variant="body2">
        Any edits to operation information made here will only apply to this
        report. You can{" "}
        <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
          <span>
            <Link
              href={`/administration/operations/${operationId}?operations_title=${operationName}&isNewTab=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit no-underline inline-flex items-center"
            >
              update operation information
              <OpenInNewIcon fontSize="inherit" className="ml-[0.1rem]" />
            </Link>{" "}
          </span>
        </Tooltip>
        in the operations page.
      </Typography>
    </Box>
  </Paper>
);

export const operationRepresentativeLink = (
  operationId: string = "",
  operationName: string = "",
) => {
  const href = `/administration/operations/${operationId}?operations_title=${operationName}&isNewTab=true`;
  return (
    <>
      Before you can continue, you must{" "}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bc-link-blue underline inline-flex items-center"
      >
        add an operation representative for this operation
        <OpenInNewIcon
          fontSize="inherit"
          className="text-bc-link-blue ml-[0.1rem]"
        />
      </Link>{" "}
      then return to this report
    </>
  );
};
export const reportTypeHelperText =
  "Simple Reports are submitted by reporting operations that previously emitted greater than or equal to 10 000 tCO2e of attributable emissions in a reporting period, but now emit under 10 000 tCO2e of attributable emissions and have an obligation to continue reporting emissions for three consecutive reporting periods. This report type is not applicable for any operations that received third party verification in the immediately preceding reporting period, and is not applicable for opted-in operations.";
