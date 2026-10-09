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
  noSaveButton?: boolean;
  backButtonText?: string;
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
  noSaveButton,
  backButtonText,
}) => {
  const router = useRouter();
  const saveButtonContent = isSaving ? (
    <CircularProgress
      data-testid="progressbarsave"
      role="progressbar"
      size={24}
    />
  ) : isSuccess ? (
    "✅ Success"
  ) : (
    "Save"
  );

  const saveAndContinueButtonContent = isSaving ? (
    <CircularProgress data-testid="progressbar" role="progressbar" size={24} />
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
    <Box className="flex justify-between mt-6">
      <div>
        {backUrl && (
          <Button
            variant="outlined"
            onClick={() => {
              router.push(backUrl);
            }}
          >
            {backButtonText || "Back"}
          </Button>
        )}
        {!noSaveButton && (
          <Button
            variant="contained"
            color="primary"
            disabled={isSaving || saveButtonDisabled}
            className="mx-6"
            type="submit"
            onClick={() => {
              if (noFormSave) noFormSave();
            }}
          >
            {saveButtonContent}
          </Button>
        )}
      </div>
      <Button
        variant="contained"
        color="primary"
        disabled={isSaving || submitButtonDisabled}
        className="px-8"
        onClick={() => {
          if (saveAndContinue) {
            saveAndContinue();
          } else {
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
