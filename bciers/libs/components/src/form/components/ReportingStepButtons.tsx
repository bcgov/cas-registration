"use client";

import { Box, Button, CircularProgress } from "@mui/material";
import Link from "next/link";

interface StepButtonProps {
  allowBackNavigation: boolean;
  backUrl?: string;
  continueUrl: string;
  isSaving: boolean;
  isSuccess: boolean;
  saveButtonDisabled?: boolean;

}

const ReportingStepButtons: React.FunctionComponent<StepButtonProps> = ({
  backUrl,
  continueUrl,
  isSaving,
  isSuccess,
  saveButtonDisabled
}) => {
  const saveButtonContent = isSaving ? (
    <CircularProgress data-testid="progressbar" role="progress" size={24} />
  ) : isSuccess ? (
    "✅ Success"
  ) : (
    "Save"
  );

  return (
    <Box display="flex" justifyContent="space-between" mt={3}>
      <div>
        {backUrl && (
          <Link href={backUrl} passHref>
            <Button variant="outlined">Back</Button>
          </Link>
        )}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSaving || saveButtonDisabled}
          sx={{mx: 3}}
        >
          {saveButtonContent}
        </Button>
      </div>
      <Link href={continueUrl} passHref>
        <Button
          variant="contained"
          color="primary"
        >
          Continue
        </Button>
      </Link>
    </Box>
  );
};

export default ReportingStepButtons;
