"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { actionHandler } from "@bciers/actions";
import { newEntrantUiSchema } from "@reporting/src/data/jsonSchema/newEntrantInformation/newEntrantInformation";
import { newEntrantSchema } from "@reporting/src/data/jsonSchema/newEntrantInformation/newEntrantInformationSchema";
import { IChangeEvent } from "@rjsf/core";
import { NavigationInformation } from "../../taskList/types";

interface NewEntrantInfornationProps {
  version_id: number;
  initialFormData: { assertion_statement?: boolean };
  navigationInformation: NavigationInformation;
}

export default function NewEntrantInformationForm({
  version_id,
  initialFormData,
  navigationInformation,
}: NewEntrantInfornationProps) {
  const [formData, setFormData] = useState(initialFormData || {});
  const [errors, setErrors] = useState<string[]>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(
    !initialFormData.assertion_statement,
  );

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };
    setFormData(updatedData);
    if (updatedData.assertion_statement) {
      setSubmitButtonDisabled(false);
    } else {
      setSubmitButtonDisabled(true);
    }
  };
  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/new-entrant-data`;
    const method = "POST";
    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(data),
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
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={newEntrantSchema}
      uiSchema={newEntrantUiSchema}
      formData={formData}
      backUrl={navigationInformation.backUrl}
      onChange={handleChange}
      onSubmit={(data) => handleSubmit(data.formData)}
      submitButtonDisabled={submitButtonDisabled}
      formContext={formData}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
    />
  );
}
