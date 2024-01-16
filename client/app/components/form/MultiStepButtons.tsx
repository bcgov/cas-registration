"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";
import Link from "next/link";

interface SubmitButtonProps {
  baseUrl: string;
  cancelUrl: string;
  classNames?: string;
  disabled?: boolean;
  isSubmitting: boolean;
  step: number;
  steps: string[];
  allowBackNavigation?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  allowBackNavigation,
  baseUrl,
  cancelUrl,
  classNames,
  disabled,
  isSubmitting,
  step,
  steps,
}) => {
  const { pending } = useFormStatus();
  const isFinalStep = step === steps.length - 1;
  const isDisabled = disabled || pending || isSubmitting;

  return (
    <div className={`flex w-full mt-8 justify-between ${classNames}`}>
      {cancelUrl && (
        <Link href={cancelUrl}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      )}
      <div>
        {allowBackNavigation &&
          (step !== 0 ? (
            <Link href={`${baseUrl}/${step}`}>
              <Button
                variant="contained"
                type="button"
                disabled={step === 0}
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
          <Link href={`${baseUrl}/${step + 2}`}>
            <Button
              variant="contained"
              type="button"
              disabled={isFinalStep || isSubmitting}
            >
              Next
            </Button>
          </Link>
        ) : (
          <Button
            type="submit"
            aria-disabled={isDisabled}
            disabled={isDisabled}
            variant="contained"
          >
            {!isFinalStep ? "Next" : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
