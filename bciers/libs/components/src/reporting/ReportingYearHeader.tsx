import { Paper, Typography, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface ReportingYearHeaderProps {
  reportingYear: number;
  reportDueYear: number;
  /**
   * Layout variant:
   * - "dashboard": Title and due date stacked, with info box below
   * - "inline": Title and due date side-by-side (for reports page)
   */
  variant?: "dashboard" | "inline";
  /**
   * Show the info box about keeping operation information up to date
   */
  showInfoBox?: boolean;
}

export default function ReportingYearHeader({
  reportingYear,
  reportDueYear,
  variant = "dashboard",
  showInfoBox = false,
}: ReportingYearHeaderProps) {
  if (variant === "inline") {
    return (
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reporting year {reportingYear}</h2>
        <h3 className="text-bc-text text-right">
          Reports due May 31, {reportDueYear}
        </h3>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold">Reporting year {reportingYear}</h2>
      <p className="text-bc-text text-left">
        Reports due <b>May 31, {reportDueYear}</b>
      </p>
      {showInfoBox && (
        <Paper className="p-4 mb-6 bg-bc-light-blue text-bc-text">
          <Box className="flex items-center">
            <InfoIcon className="mr-2" />
            <Typography variant="body2">
              Ensure operation information is up to date before reporting.
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
}
