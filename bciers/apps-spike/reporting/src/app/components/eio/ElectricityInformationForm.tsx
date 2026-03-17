"use client";
import React, { useState } from "react";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { eioSchema, eioUiSchema } from "@reporting/src/data/jsonSchema/eio";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { actionHandler } from "@bciers/actions";

interface Props {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
}

const ElectricityInformationForm: React.FC<Props> = ({
  versionId,
  initialFormData,
  navigationInformation,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>();
  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/electricity-import-data`;
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
      schema={eioSchema}
      uiSchema={eioUiSchema}
      formData={formData}
      backUrl={navigationInformation.backUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => handleSubmit(data.formData)}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
    />
  );
};

export default ElectricityInformationForm;
