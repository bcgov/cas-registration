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
  const [errors, setErrors] = useState<string[]>();
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);

  const saveAndContinueUrl = `/reports/${version_id}/attachments${queryString}`;
  const backUrl = `/reports/${version_id}/final-review${queryString}`;

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };
    // Update the form state with the modified data
    setFormData(updatedData);
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
      uiSchema={verificationUiSchema}
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
