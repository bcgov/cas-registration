"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { actionHandler } from "@bciers/actions";
import { newEntrantUiSchema } from "@reporting/src/data/jsonSchema/newEntrantInformation/newEntrantInformation";
import { newEntrantSchema } from "@reporting/src/data/jsonSchema/newEntrantInformation/newEntrantInformationSchema";
import { IChangeEvent } from "@rjsf/core";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { handleApiResponse } from "@reporting/src/app/utils/handleApiResponse";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";

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
  const { setErrors, renderedErrors } = useFormErrors();
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

    return handleApiResponse(response, setErrors);
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
      onChange={handleChange as (data: object) => void}
      onSubmit={(data: object, _navigateAfterSubmit: boolean) =>
        handleSubmit((data as any).formData)
      }
      submitButtonDisabled={submitButtonDisabled}
      formContext={formData}
      continueUrl={navigationInformation.continueUrl}
      errors={renderedErrors}
    />
  );
}
