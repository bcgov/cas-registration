"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";
import Link from "next/link";

interface SubmitButtonProps {
  baseUrl: string;
  cancelUrl: string;
  classNames?: string;
  step: number;
  steps: string[];
  submitEveryStep?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  baseUrl,
  step,
  steps,
  cancelUrl,
  classNames,
  submitEveryStep,
}) => {
  const { pending } = useFormStatus();
  const isFinalStep = step === steps.length - 1;
  return (
    <div className={`flex w-full mt-8 justify-between ${classNames}`}>
      {cancelUrl && (
        <Link href={cancelUrl}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      )}
      <div>
        {step !== 0 ? (
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
        )}
        {!isFinalStep && !submitEveryStep && (
          <Link href={`${baseUrl}/${step + 2}`}>
            <Button variant="contained" type="button" disabled={isFinalStep}>
              Next
            </Button>
          </Link>
        )}
        {isFinalStep && !submitEveryStep && (
          <Button type="submit" aria-disabled={pending} variant="contained">
            Submit
          </Button>
        )}
        {submitEveryStep && (
          <Button type="submit" aria-disabled={pending} variant="contained">
            {!isFinalStep ? "Next" : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
