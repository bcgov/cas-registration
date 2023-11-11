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
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  baseUrl,
  step,
  steps,
  cancelUrl,
  classNames,
}) => {
  const { pending } = useFormStatus();
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
        {step !== steps.length - 1 ? (
          <Link href={`${baseUrl}/${step + 2}`}>
            <Button
              variant="contained"
              type="button"
              disabled={step === steps.length - 1}
            >
              Next
            </Button>
          </Link>
        ) : (
          <Button type="submit" aria-disabled={pending} variant="contained">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
