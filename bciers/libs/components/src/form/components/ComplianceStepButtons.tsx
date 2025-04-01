"use client";

import {
  BC_GOV_BACKGROUND_COLOR_BLUE,
  BC_GOV_LINKS_COLOR,
  BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
  BC_GOV_COMPONENTS_GREY,
  BC_GOV_BACKGROUND_COLOR_GREY,
} from "@bciers/styles";
import { Box, Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface ComplianceStepButtonsProps {
  backUrl?: string;
  continueUrl?: string;
  onBackClick?: () => void;
  onContinueClick?: () => void;

  backButtonDisabled?: boolean;
  middleButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;

  backButtonText?: string;
  continueButtonText?: string;

  middleButtonText?: string;
  onMiddleButtonClick?: () => void;
  middleButtonActive?: boolean;

  saveButtonDisabled?: boolean;
  saveAndContinue?: () => void;
  noFormSave?: () => void;
  noSaveButton?: boolean;
  customButtons?: React.ReactNode;
  children?: React.ReactNode;
}

const ComplianceStepButtons: React.FunctionComponent<
  ComplianceStepButtonsProps
> = ({
  backUrl,
  continueUrl,
  onBackClick,
  onContinueClick,

  backButtonDisabled,
  middleButtonDisabled,
  submitButtonDisabled,

  backButtonText = "Back",
  continueButtonText = "Continue",

  middleButtonText,
  onMiddleButtonClick,
  middleButtonActive = true,

  customButtons,
  children,
}) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 2,
        mb: 2,
      }}
    >
      <div>
        {(backUrl || onBackClick) && (
          <Button
            variant="outlined"
            onClick={
              onBackClick
                ? onBackClick
                : backUrl
                ? () => router.push(backUrl)
                : undefined
            }
            disabled={backButtonDisabled}
            data-testid="back-button"
            sx={{
              width: "120px",
              height: "50px",
              borderColor: BC_GOV_BACKGROUND_COLOR_BLUE,
              color: BC_GOV_LINKS_COLOR,
              "&:hover": {
                borderColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
              },
              "&.Mui-disabled": {
                borderColor: `${BC_GOV_COMPONENTS_GREY} !important`,
                color: `${BC_GOV_BACKGROUND_COLOR_GREY} !important`,
              },
            }}
          >
            {backButtonText}
          </Button>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        {middleButtonText && onMiddleButtonClick && middleButtonActive && (
          <Button
            variant="outlined"
            onClick={onMiddleButtonClick}
            disabled={middleButtonDisabled}
            data-testid="middle-button"
            sx={{
              padding: "16px 41px",
              borderColor: BC_GOV_BACKGROUND_COLOR_BLUE,
              color: BC_GOV_LINKS_COLOR,
              "&:hover": {
                borderColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
              },
              "&.Mui-disabled": {
                borderColor: `${BC_GOV_COMPONENTS_GREY} !important`,
                color: `${BC_GOV_BACKGROUND_COLOR_GREY} !important`,
              },
            }}
          >
            {middleButtonText}
          </Button>
        )}

        {children || customButtons}

        {(continueUrl || onContinueClick) && (
          <Button
            variant="contained"
            onClick={
              onContinueClick
                ? onContinueClick
                : continueUrl
                ? () => router.push(continueUrl)
                : undefined
            }
            disabled={submitButtonDisabled}
            data-testid="continue-button"
            sx={{
              width: "120px",
              height: "50px",
              backgroundColor: BC_GOV_BACKGROUND_COLOR_BLUE,
              "&:hover": {
                backgroundColor: BC_GOV_PRIMARY_BRAND_COLOR_BLUE,
              },
              "&.Mui-disabled": {
                backgroundColor: `${BC_GOV_COMPONENTS_GREY} !important`,
                color: `${BC_GOV_BACKGROUND_COLOR_GREY} !important`,
              },
            }}
          >
            {continueButtonText}
          </Button>
        )}
      </div>
    </Box>
  );
};

export default ComplianceStepButtons;
