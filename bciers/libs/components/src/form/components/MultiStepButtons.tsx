"use client";

import { Button } from "@mui/material";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface SubmitButtonProps {
  baseUrl: string;
  cancelUrl: string;
  classNames?: string;
  disabled?: boolean;
  isSubmitting: boolean;
  stepIndex: number;
  steps: string[];
  allowBackNavigation?: boolean;
  submitButtonText?: string;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  allowBackNavigation,
  baseUrl,
  cancelUrl,
  classNames,
  disabled,
  isSubmitting,
  stepIndex,
  steps,
  submitButtonText,
}) => {
  const isFinalStep = stepIndex === steps.length - 1;
  const isDisabled = disabled || isSubmitting;
  const { data: session } = useSession();

  const isIndustryUser = session?.user?.app_role?.includes("industry");
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
        {!isFinalStep && disabled ? (
          <Link href={`${baseUrl}/${stepIndex + 2}`}>
            <Button
              variant="contained"
              type="button"
              disabled={isFinalStep || isSubmitting}
            >
              {isSubmitting ? "Save and Continue" : "Next"}
            </Button>
          </Link>
        ) : (
          isIndustryUser && (
            <Button
              type="submit"
              aria-disabled={isDisabled}
              disabled={isDisabled}
              variant="contained"
            >
              {!isFinalStep
                ? "Save and Continue"
                : submitButtonText ?? "Submit"}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
