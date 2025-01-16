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

interface Props {
  version_id: number;
  verificationSchema: RJSFSchema;
  verificationUiSchema: RJSFSchema;
  initialData: any;
  taskListElements: TaskListElement[];
}

export default function VerificationForm({
  version_id,
  verificationSchema,
  verificationUiSchema,
  initialData,
  taskListElements,
}: Props) {
  const [formData, setFormData] = useState(initialData);
  const [uiSchema, setUiSchema] = useState(verificationUiSchema); // State for uiSchema
  const [errors, setErrors] = useState<string[]>();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);

  const saveAndContinueUrl = `/reports/${version_id}/attachments${queryString}`;
  const backUrl = `/reports/${version_id}/compliance-summary${queryString}`;

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };
    const updatedUiSchema = { ...uiSchema }; // Copy uiSchema for updates

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
        updatedData.visit_types = updatedData.visit_names.map(
          (visit_name: string) => {
            const existingVisitType = updatedData.visit_types?.find(
              (item: { visit_name: string }) => item.visit_name === visit_name,
            );

            // Update the label dynamically for visit_type in uiSchema
            if (!updatedUiSchema.visit_types) {
              updatedUiSchema.visit_types = { items: {} };
            }
            updatedUiSchema.visit_types.items.visit_type = {
              "ui:title": `Visit Type for ${visit_name}`, // Dynamic label
            };

            // Create or retain visit_type object
            return (
              existingVisitType ?? {
                visit_name,
                visit_type: "", // Default blank visit_type
              }
            );
          },
        );
      }
    }

    // Update form data and uiSchema states
    setFormData(updatedData);
    setUiSchema(updatedUiSchema);
  };

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${version_id}/report-verification`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";

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

  return (
    <MultiStepFormWithTaskList
      steps={multiStepHeaderSteps}
      initialStep={4}
      taskListElements={taskListElements}
      schema={verificationSchema}
      uiSchema={uiSchema} // Use dynamic uiSchema
      formData={formData}
      baseUrl={baseUrlReports}
      cancelUrl={cancelUrlReports}
      backUrl={backUrl}
      onChange={handleChange}
      onSubmit={handleSubmit}
      errors={errors}
      continueUrl={saveAndContinueUrl}
    />
  );
}
