"use client";
import { useState } from "react";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useSearchParams } from "next/navigation";
import {
  baseUrlReports,
  cancelUrlReports,
} from "@reporting/src/app/utils/constants";
import { actionHandler } from "@bciers/actions";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";
import { lfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";

interface Props {
  version_id: number;
  verificationSchema: RJSFSchema;
  initialData: any;
  taskListElements: TaskListElement[];
}

export default function VerificationForm({
  version_id,
  verificationSchema,
  initialData,
  taskListElements,
}: Props) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);

  const saveAndContinueUrl = `/reports/${version_id}/attachments${queryString}`;
  const backUrl = `/reports/${version_id}/compliance-summary${queryString}`;

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };

    if (Array.isArray(updatedData.visit_names)) {
      const selectedValues = updatedData.visit_names;

      // Check if "None" is selected
      if (
        selectedValues.includes("None") ||
        e.formData.visit_names?.includes("None")
      ) {
        // Lock selection to "None" only
        updatedData.visit_names = ["None"];
        updatedData.visit_types = []; // Clear visit_types
      } else {
        // Remove "None" and handle visit_names
        updatedData.visit_names = selectedValues.filter(
          (value: string) => value !== "None",
        );

        // Update visit_types and dynamically update the label for visit_type
        updatedData.visit_types = updatedData.visit_names
          .filter((visit_name: string) => visit_name !== "Other") // Exclude "Other"
          .map((visit_name: string) => {
            const existingVisitType = updatedData.visit_types?.find(
              (item: { visit_name: string }) => item.visit_name === visit_name,
            );
            // Create or retain visit_type object
            return (
              existingVisitType ?? {
                visit_name,
                visit_type: "", // Default blank visit_type
              }
            );
          });
      }
    }

    // Update form data state
    setFormData(updatedData);
  };

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${version_id}/report-verification`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";
    console.log("********************formData**********************");
    console.log(JSON.stringify(formData));
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(formData),
    });

    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };
  const verificationUiSchema = lfoUiSchema;

  return (
    <MultiStepFormWithTaskList
      steps={multiStepHeaderSteps}
      initialStep={4}
      taskListElements={taskListElements}
      schema={verificationSchema}
      uiSchema={verificationUiSchema}
      formData={formData}
      baseUrl={baseUrlReports}
      cancelUrl={cancelUrlReports}
      backUrl={backUrl}
      onChange={handleChange}
      onSubmit={handleSubmit}
      errors={errors}
      continueUrl={saveAndContinueUrl}
      formContext={{
        visit_types: formData?.visit_types,
      }}
    />
  );
}
