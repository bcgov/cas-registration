"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  changeReviewSchema,
  changeReviewUiSchema,
} from "@reporting/src/data/jsonSchema/changeReview/changeReview";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";

interface ChangeReviewProps {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
}

interface FormData {
  reason_for_change: string;
}

export default function ChangeReviewForm({
  versionId,
  initialFormData,
  navigationInformation,
}: ChangeReviewProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>();

  const handleSubmit = async (data: FormData) => {
    const endpoint = `reporting/report-version/${versionId}/report-change`;
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
      schema={changeReviewSchema}
      uiSchema={changeReviewUiSchema}
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
}
