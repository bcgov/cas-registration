"use client";
import { useState } from "react";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  baseUrlReports,
  cancelUrlReports,
} from "@reporting/src/app/utils/constants";
import { actionHandler } from "@bciers/actions";
import { lfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { handleVerificationData } from "@reporting/src/app/utils/verification/handleVerificationData";
import { OperationTypes } from "@bciers/utils/src/enums";
// TEMPORARY: remmed to support #607
// import { mergeVerificationData } from "@reporting/src/app/utils/verification/mergeVerificationData";

interface Props {
  version_id: number;
  operationType: string;
  verificationSchema: RJSFSchema;
  initialData: any;
  taskListElements: TaskListElement[];
}

export default function VerificationForm({
  version_id,
  operationType,
  verificationSchema,
  initialData,
  taskListElements,
}: Props) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>();

  const saveAndContinueUrl = `/reports/${version_id}/attachments`;
  const backUrl = `/reports/${version_id}/final-review`;

  const verificationUiSchema =
    operationType === OperationTypes.SFO ? sfoUiSchema : lfoUiSchema;

  // 🛠️ Function to handle form changes affecting ui schema
  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };

    // LFO;SFO visit_names handling logic
    handleVerificationData(updatedData, operationType);

    // 🔄 Update the form data state with the modified data
    setFormData(updatedData);
  };

  // 🛠️ Function to handle form submit
  const handleSubmit = async () => {
    // 📷 Clone formData as payload
    const payload = { ...formData };

    // TEMPORARY: remmed to support #607
    // ➕ Update report_verification_visits property based on visit_types and visit_others
    // mergeVerificationData(payload);

    // TEMPORARY: added to support #607
    // ➕ Update report with hidden fields
    payload.scope_of_verification = "";
    payload.verification_conclusion = "";

    // 🧼 Remove unnecessary properties from payload
    delete payload.visit_names;
    delete payload.visit_types;
    delete payload.visit_others;

    // 🚀 API variables
    const endpoint = `reporting/report-version/${version_id}/report-verification`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    // 🐜 Check for errors
    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    // ✅ Return Success
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
      formContext={{
        visit_types: formData?.visit_types, // set formContext to use in UiSchema
      }}
    />
  );
}
