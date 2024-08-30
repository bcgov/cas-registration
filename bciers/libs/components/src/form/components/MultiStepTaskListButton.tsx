"use client";

import React from "react";
import { Button } from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface MultiStepTaskListButtonProps {
  stepIndex: number;
  steps: string[];
  allowBackNavigation?: boolean;
  baseUrl: string;
  cancelUrl: string;
  isSubmitting: boolean;
  submitButtonText?: string;
  submitButtonDisabled?: boolean;
  onSaveAndContinue: () => void; // Function to handle save and continue
}

const MultiStepTaskListButton: React.FC<MultiStepTaskListButtonProps> = ({
  stepIndex,
  steps,
  allowBackNavigation = true,
  baseUrl,
  cancelUrl,
  isSubmitting,
  submitButtonText = "Save and Continue",
  submitButtonDisabled = false,
  onSaveAndContinue,
}) => {
  const isFinalStep = stepIndex === steps.length - 1;
  const { data: session } = useSession();

  // Determine if the user has an industry role
  const isIndustryUser = session?.user?.app_role?.includes("industry");

  // Determine if the button should be disabled
  const isDisabled = submitButtonDisabled || isSubmitting;

  return (
    <div className="flex w-full mt-2 justify-between">
      {/* Cancel Button */}
      {cancelUrl && (
        <Link href={cancelUrl} passHref>
          <Button variant="outlined">Cancel</Button>
        </Link>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        {/* Back Button */}
        {allowBackNavigation && stepIndex > 0 && (
          <Link href={`${baseUrl}/step/${stepIndex - 1}`} passHref>
            <Button variant="outlined" disabled={stepIndex === 0}>
              Back
            </Button>
          </Link>
        )}

        {/* Save and Continue or Submit Button */}
        {isIndustryUser && (
          <>
            {/* Save and Continue Button */}
            {!isFinalStep && (
              <Button
                variant="contained"
                color="primary"
                onClick={onSaveAndContinue} // Calls function to handle save and continue
                disabled={isDisabled}
              >
                {isSubmitting ? "Saving..." : submitButtonText}
              </Button>
            )}

            {/* Submit Button */}
            {isFinalStep && (
              <Button
                type="submit"
                variant="contained"
                aria-disabled={isDisabled}
                disabled={isDisabled}
              >
                {submitButtonText ?? "Submit"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MultiStepTaskListButton;
