"use client";

import React, { useState } from "react";
import MultiStepHeader from "./components/MultiStepHeader";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { FormBase } from "@bciers/components/form/index";
import { RJSFSchema } from "@rjsf/utils";
import MultiStepTaskListButton from "@bciers/components/form/components/MultiStepTaskListButton";
import { Box } from "@mui/material";

interface Props {
  initialStep: number;
  steps: string[];
  taskListElements: TaskListElement[];
  schema: RJSFSchema;
  uiSchema: RJSFSchema;
  formData: any;
  cancelUrl: string;
  baseUrl: string;
  onSubmit: (data: any) => Promise<void>; // Add onSubmit prop
}

const MultiStepFormWithTaskList: React.FC<Props> = ({
  initialStep,
  steps,
  taskListElements,
  schema,
  uiSchema,
  formData,
  cancelUrl,
  baseUrl,
  onSubmit, // Destructure onSubmit prop
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskList, setTaskList] = useState(taskListElements); // Manage task list state
  const [hasErrors, setHasErrors] = useState(false); // State to track form errors

  // Helper function to get the currently active task
  const getCurrentTask = () => {
    return taskList
      .flatMap((section) => section.elements ?? [])
      .find((task) => task.isActive);
  };

  // Handle moving to the next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);

      const updatedTasks = taskList.map((section, index) => ({
        ...section,
        elements: (section.elements ?? []).map((task, idx) => ({
          ...task,
          isActive: index === 0 && idx === 0 && currentStep === initialStep + 1,
        })),
      }));

      setTaskList(updatedTasks);
    }
  };

  // Handle moving to the next task or step
  const handleNextTask = () => {
    if (hasErrors) return; // Prevent proceeding if there are validation errors

    const currentTask = getCurrentTask();
    if (!currentTask) return;

    const currentSectionIndex = taskList.findIndex((section) =>
      (section.elements ?? []).includes(currentTask),
    );

    if (currentSectionIndex === -1) return; // Safeguard for invalid index

    const currentSection = taskList[currentSectionIndex];
    const currentTaskIndexInSection = (currentSection.elements ?? []).indexOf(
      currentTask,
    );

    if (
      currentTaskIndexInSection <
      (currentSection.elements ?? []).length - 1
    ) {
      const updatedSections = taskList.map((section, index) =>
        index === currentSectionIndex
          ? {
              ...section,
              elements: (section.elements ?? []).map((task, idx) => ({
                ...task,
                isActive: idx === currentTaskIndexInSection + 1,
              })),
            }
          : section,
      );
      setTaskList(updatedSections);
    } else {
      handleNextStep();
    }
  };

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data); // Call the onSubmit prop function
      // Proceed to the next task or step only after successful submission
      handleNextTask();
    } catch (error) {
      // Consider using a proper logging library
      console.error("Submission failed:", error);
      setHasErrors(true);
      // Handle errors or notify the user
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form errors
  const handleFormError = (errors: any) => {
    setHasErrors(errors.length > 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={currentStep} steps={steps} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={taskList} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleFormSubmit} // Pass handleFormSubmit to FormBase
            onError={handleFormError}
            formData={formData}
          >
            <div>
              <MultiStepTaskListButton
                stepIndex={currentStep}
                steps={steps}
                allowBackNavigation={currentStep > 0}
                baseUrl={baseUrl}
                cancelUrl={cancelUrl}
                isSubmitting={isSubmitting}
                submitButtonText="Save and Continue"
                submitButtonDisabled={isSubmitting}
                onSaveAndContinue={() => {
                  if (!hasErrors) {
                    handleNextTask(); // Only proceed to the next task if there are no errors
                  }
                }}
              />
            </div>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default MultiStepFormWithTaskList;
