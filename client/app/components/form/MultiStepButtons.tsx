"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";
import Link from "next/link";

interface SubmitButtonProps {
  baseUrl: string;
  disabled?: boolean;
  cancelUrl: string;
  classNames?: string;
  step: number;
  steps: string[];
  allowBackNavigation?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  baseUrl,
  disabled,
  step,
  steps,
  cancelUrl,
  classNames,
  allowBackNavigation,
}) => {
  const { pending } = useFormStatus();
  const isFinalStep = step === steps.length - 1;
  const isDisabled = disabled || pending;
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
        {!disabled && (
          <Button
            type="submit"
            aria-disabled={isDisabled}
            disabled={isDisabled}
            variant="contained"
          >
            {!isFinalStep ? "Next" : "Submit"}
          </Button>
        )}
        {/* When the form is not editable (e.g., IRC staff is reviewing an operation), the form should not be submitted when navigating between steps */}
        {!isFinalStep && disabled && (
          <Link href={`${baseUrl}/${step + 2}`}>
            <Button variant="contained" type="button" disabled={isFinalStep}>
              Next
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
