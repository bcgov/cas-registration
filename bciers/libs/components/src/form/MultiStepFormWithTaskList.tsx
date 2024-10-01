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
  cancelUrl?: string;
  onSubmit: () => void | Promise<void>;
  buttonText?: string;
  onChange?: (data: any) => void;
  submitButtonDisabled?: boolean;
  children?: React.ReactNode;
}

const MultiStepFormWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  schema,
  uiSchema,
  formData,
  cancelUrl,
  onSubmit,
  buttonText,
  onChange,
  submitButtonDisabled,
  children,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={initialStep} steps={steps} />
      </div>
      <div className="w-full flex">
        {/* Make the task list hidden on small screens and visible on medium and up */}
        {taskListElements.length > 0 && (
          <div className="hidden md:block">
            <ReportingTaskList elements={taskListElements} />
          </div>
        )}
        <div className="w-full">
          <FormBase
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            formData={formData}
            onChange={onChange}
          >
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
                disabled={submitButtonDisabled}
              >
                {buttonText ? buttonText : "Save and Continue"}
              </Button>
            </Box>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default MultiStepFormWithTaskList;
