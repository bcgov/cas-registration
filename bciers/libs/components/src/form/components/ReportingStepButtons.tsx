"use client";

import { Box, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";

interface StepButtonProps {
  backUrl?: string;
  continueUrl: string;
  isSaving?: boolean;
  isSuccess?: boolean;
  isRedirecting?: boolean;
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  saveAndContinue?: () => void;
  buttonText?: string;
  noFormSave?: () => void;
}

const ReportingStepButtons: React.FunctionComponent<StepButtonProps> = ({
  backUrl,
  continueUrl,
  isSaving,
  isSuccess,
  isRedirecting,
  saveButtonDisabled,
  submitButtonDisabled,
  saveAndContinue,
  buttonText,
  noFormSave,
}) => {
  const router = useRouter();
  const saveButtonContent = isSaving ? (
    <CircularProgress data-testid="progressbarsave" role="progress" size={24} />
  ) : isSuccess ? (
    "✅ Success"
  ) : (
    "Save"
  );

  const saveAndContinueButtonContent = isSaving ? (
    <CircularProgress
      data-testid="progressbar"
      role="progressContinuing"
      size={24}
    />
  ) : isRedirecting ? (
    "✅ Redirecting..."
  ) : buttonText ? (
    buttonText
  ) : !saveButtonDisabled ? (
    "Save & Continue"
  ) : (
    "Continue"
  );

  return (
    <Box display="flex" justifyContent="space-between" mt={3}>
      <div>
        {backUrl && (
          <Button
            variant="outlined"
            onClick={() => {
              router.push(backUrl);
            }}
          >
            Back
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving || saveButtonDisabled}
          sx={{ mx: 3 }}
          type="submit"
          onClick={() => {
            if (noFormSave) noFormSave();
          }}
        >
          {saveButtonContent}
        </Button>
      </div>
      <Button
        variant="contained"
        color="primary"
        disabled={isSaving || submitButtonDisabled}
        sx={{ px: 4 }}
        onClick={() => {
          if (saveAndContinue !== undefined) {
            saveAndContinue();
          } else {
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
