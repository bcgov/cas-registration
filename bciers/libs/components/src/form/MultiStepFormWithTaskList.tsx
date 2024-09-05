"use client";

import React, { useState } from "react";
import MultiStepHeader from "./components/MultiStepHeader";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { FormBase } from "@bciers/components/form/index";
import { RJSFSchema } from "@rjsf/utils";
import { Box, Button } from "@mui/material";
import Link from "next/link";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  schema: RJSFSchema;
  uiSchema: RJSFSchema;
  formData: any;
  baseUrl?: string;
  cancelUrl?: string; // Make cancelUrl optional
  saveAndContinueUrl: string;
  onSubmit: (data: any) => Promise<void>;
}

const MultiStepFormWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  schema,
  uiSchema,
  formData,
  cancelUrl,
  saveAndContinueUrl,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const handleFormError = (errors: any) => {
    setHasErrors(errors.length > 0);
    if (errors.length > 0) {
      console.warn("Validation errors:", errors);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskListElements} />
        <div className="w-full">
          <FormBase
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            onError={handleFormError}
            formData={formData}
          >
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
              >
                Save and Continue
              </Button>
            </Box>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default MultiStepFormWithTaskList;
