"use client";

import React, { useState } from "react";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { Alert, Box, Button } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import Link from "next/link";

/**
 * Similar to the MultiStepFormWithTaskList,
 * except doesn't display a for, but can be used as a wrapper for any other page for a consistent look.
 */

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  onSubmit: () => Promise<void>;
  children?: React.ReactNode;
  cancelUrl?: string;
  saveButtonText?: string;
  submittingButtonText?: string;
  error?: string;
}

const MultiStepWrapperWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  onSubmit,
  children,
  cancelUrl,
  saveButtonText,
  submittingButtonText,
  error,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      {error && (
        <div className="min-h-6">
          <Alert severity="error">{error}</Alert>
        </div>
      )}
      <div className="w-full flex">
        {/* Make the task list hidden on small screens and visible on medium and up */}
        <div className="hidden md:block">
          <ReportingTaskList elements={taskListElements} />
        </div>
        <div className="w-full">
          {children}
          <Box display="flex" justifyContent="space-between" mt={3}>
            {cancelUrl && (
              <Link href={cancelUrl} passHref>
                <Button variant="outlined">Cancel</Button>
              </Link>
            )}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? submittingButtonText ?? "Saving..."
                : saveButtonText ?? "Save and Continue"}
            </Button>
          </Box>
        </div>
      </div>
    </Box>
  );
};

export default MultiStepWrapperWithTaskList;
