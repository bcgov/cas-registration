"use client";

import { Button } from "@mui/material";
import SubmitButton from "@bciers/components/button/SubmitButton";
import Link from "next/link";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface SubmitButtonProps {
  cancelUrl: string;
  classNames?: string;
  disabled?: boolean;
  isSubmitting: boolean;
  stepIndex: number;
  steps: string[];
  submitButtonText?: string;
  allowBackNavigation?: boolean;
  baseUrl?: string;
  submitButtonDisabled?: boolean;
}

const MultiStepButtons: React.FunctionComponent<SubmitButtonProps> = ({
  allowBackNavigation,
  baseUrl,
  cancelUrl,
  classNames,
  disabled,
  isSubmitting,
  stepIndex,
  steps,
  submitButtonText,
  submitButtonDisabled,
}) => {
  const isFinalStep = stepIndex === steps.length - 1;
  const isDisabled = disabled || isSubmitting;
  const role = useSessionRole();

  const isIndustryUser = role?.includes("industry");

  // If the submit button text is not provided, default to "Save and Continue" for all steps except the final step
  let submitBtnText = submitButtonText
    ? submitButtonText
    : !isFinalStep
    ? "Save and Continue"
    : "Submit";

  return (
    <div className={`flex w-full mt-2 justify-between ${classNames}`}>
      {cancelUrl && (
        <Link href={cancelUrl}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      )}
      <div>
        {allowBackNavigation &&
          (stepIndex !== 0 ? (
            <Link href={`${baseUrl}/${stepIndex}`}>
              <Button
                variant="contained"
                type="button"
                disabled={stepIndex === 0}
                className="mr-4"
              >
                Back
              </Button>
            </Link>
          ) : (
            <Button variant="contained" type="button" disabled className="mr-4">
              Back
            </Button>
          ))}
        {/* When the form is editable, the form should be submitted when navigating between steps */}
        {/* When the form is not editable (e.g., IRC staff is reviewing an operation), the form should not be submitted when navigating between steps */}
        {!isFinalStep && disabled && !isSubmitting ? (
          <Link href={`${baseUrl}/${stepIndex + 2}`}>
            <Button
              variant="contained"
              type="button"
              disabled={submitButtonDisabled ?? isSubmitting}
              aria-disabled={submitButtonDisabled ?? isSubmitting}
            >
              Next
            </Button>
          </Link>
        ) : (
          isIndustryUser && (
            <SubmitButton
              disabled={submitButtonDisabled ?? isDisabled}
              isSubmitting={isSubmitting}
            >
              {submitBtnText}
            </SubmitButton>
          )
        )}
      </div>
    </div>
  );
};

export default MultiStepButtons;
