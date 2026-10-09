"use client";
import Check from "@bciers/components/icons/Check";
import Link from "next/link";
import { Button, Box, Typography } from "@mui/material";

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
    <Box className="flex justify-center mt-20">
      <Box
        className="flex flex-col items-center"
        maxWidth={600}
        minHeight="20vh"
      >
        <Box className="flex flex-col items-center">
          <Check />
        </Box>
        <Box className="mt-6 text-center">
          <Typography gutterBottom className="font-inter font-semibold">
            Successful Submission
          </Typography>
          <Typography>{successMessage}</Typography>
          <Typography className="mt-2">
            Submission time: {submissionDate}
          </Typography>
        </Box>
        <Box className="mt-6 flex flex-col items-center gap-4">
          {isSupplementaryReport && (
            <Button
              variant="outlined"
              component={Link}
              href={`/reports/report-history/${reportId}`}
              className="w-50 text-bc-link-blue font-inter"
            >
              View report history
            </Button>
          )}
          <Button
            variant="outlined"
            component={Link}
            href="/reports/current-reports"
            className="w-50 text-bc-link-blue font-inter"
          >
            Return to report table
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
