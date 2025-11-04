import { Paper, Typography, Box } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";

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
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: LIGHT_BLUE_BG_COLOR,
            color: BC_GOV_TEXT,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <InfoIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Ensure operation information is up to date before reporting.
            </Typography>
          </Box>
        </Paper>
      )}
    </>
  );
}
