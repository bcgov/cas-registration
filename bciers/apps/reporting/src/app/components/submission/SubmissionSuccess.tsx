import Check from "@bciers/components/icons/Check";
import Link from "next/link";
import { Button, Box, Typography } from "@mui/material";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles";

interface Props {
  submissionDate: string;
  isSupplementaryReport: boolean;
  reportId: string;
}

export default function SubmissionSuccess({
  submissionDate,
  isSupplementaryReport,
  reportId,
}: Props) {
  const successMessage = isSupplementaryReport
    ? "You have successfully submitted a supplementary report."
    : "You successfully submitted your report.";

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        maxWidth={600}
        height="20vh"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Check />
        </Box>
        <Box mt={3} textAlign="center">
          <Typography
            gutterBottom
            sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
          >
            Successful Submission
          </Typography>
          <Typography>{successMessage}</Typography>
          <Typography mt={1}>Submission time: {submissionDate}</Typography>
        </Box>
        <Box
          mt={3}
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
        >
          {isSupplementaryReport && (
            <Button
              variant="outlined"
              component={Link}
              href={`/reports/report-history/${reportId}`}
              sx={{
                width: 200,
                color: BC_GOV_LINKS_COLOR,
                fontFamily: "Inter, sans-serif",
              }}
            >
              View report history
            </Button>
          )}
          <Button
            variant="outlined"
            component={Link}
            href="/reports/current-reports"
            sx={{
              width: 200,
              color: BC_GOV_LINKS_COLOR,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Return to report table
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
