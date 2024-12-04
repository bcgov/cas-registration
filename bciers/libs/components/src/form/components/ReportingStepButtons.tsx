"use client";

import { Box, Button, CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StepButtonProps {
  backUrl?: string;
  continueUrl: string;
  isSaving?: boolean;
  isSuccess?: boolean;
  isRedirecting?: boolean;
  saveButtonDisabled?: boolean;
  saveAndContinue?: () => void;
}

const ReportingStepButtons: React.FunctionComponent<StepButtonProps> = ({
  backUrl,
  continueUrl,
  isSaving,
  isSuccess,
  isRedirecting,
  saveButtonDisabled,
  saveAndContinue,
}) => {
  const router = useRouter();
  const saveButtonContent = isSaving ? (
    <CircularProgress data-testid="progressbar" role="progress" size={24} />
  ) : isSuccess ? (
    "✅ Success"
  ) : (
    "Save"
  );

  const saveAndContinueButtonContent = isSaving ? (
    <CircularProgress data-testid="progressbar" role="progress" size={24} />
  ) : isRedirecting ? (
    "✅ Redirecting..."
  ) : !saveButtonDisabled ? (
    "Save & Continue"
  ) : (
    "Continue"
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
          disabled={isSaving || saveButtonDisabled}
          sx={{ mx: 3 }}
          type="submit"
        >
          {saveButtonContent}
        </Button>
      </div>
      <Button
        variant="contained"
        color="primary"
        disabled={isSaving}
        sx={{ px: 4 }}
        onClick={() => {
          if (saveAndContinue !== undefined) saveAndContinue();
          else {
            isRedirecting = true;
            router.push(continueUrl);
          }
        }}
      >
        {saveAndContinueButtonContent}
      </Button>
    </Box>
  );
};

export default ReportingStepButtons;
