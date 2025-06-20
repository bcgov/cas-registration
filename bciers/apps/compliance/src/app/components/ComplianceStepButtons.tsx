"use client";

import { Button } from "@mui/material";
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
  saveAndContinue?: () => void;
  children?: React.ReactNode;
  className?: string;
  continueButtonType?: "button" | "submit";
}

export const ComplianceStepButtons: React.FC<ComplianceStepButtonsProps> = ({
  backUrl,
  continueUrl,
  onBackClick,
  onContinueClick,
  backButtonText = "Back",
  continueButtonText = "Continue",
  backButtonDisabled = false,
  submitButtonDisabled = false,
  middleButtonText,
  onMiddleButtonClick,
  middleButtonDisabled = false,
  middleButtonActive = true,
  continueButtonType = "button",
  children,
  className = "mt-20",
}: ComplianceStepButtonsProps) => {
  const router = useRouter();

  // Default navigation function
  const navigate = (url?: string) => {
    if (url) {
      router.push(url);
    }
  };

  return (
    <div className={`flex justify-between ${className}`}>
      <div>
        {(backUrl || onBackClick) && (
          <Button
            variant="outlined"
            onClick={onBackClick ?? (() => navigate(backUrl))}
            disabled={backButtonDisabled}
            className="py-2.5 min-w-[120px] border-bc-blue text-bc-links hover:border-bc-primary-blue disabled:border-bc-grey disabled:text-bc-grey-bg"
          >
            {backButtonText}
          </Button>
        )}
      </div>
      <div className="flex gap-2">
        {middleButtonText && onMiddleButtonClick && middleButtonActive && (
          <Button
            variant={middleButtonDisabled ? "contained" : "outlined"}
            onClick={onMiddleButtonClick}
            disabled={middleButtonDisabled}
            className="py-2.5 min-w-[120px] border-bc-blue text-bc-links hover:border-bc-primary-blue disabled:border-bc-grey disabled:text-bc-grey-bg"
          >
            {middleButtonText}
          </Button>
        )}

        {children}

        {(continueUrl || onContinueClick) && (
          <Button
            variant="contained"
            onClick={onContinueClick ?? (() => navigate(continueUrl))}
            disabled={submitButtonDisabled}
            className="py-2.5 min-w-[120px] bg-bc-blue hover:bg-bc-primary-blue disabled:bg-bc-grey disabled:text-bc-grey-bg"
            type={continueButtonType}
          >
            {continueButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ComplianceStepButtons;
