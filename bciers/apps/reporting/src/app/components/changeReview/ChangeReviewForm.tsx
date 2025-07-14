"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  changeReviewSchema,
  changeReviewUiSchema,
} from "@reporting/src/data/jsonSchema/changeReview/changeReview";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import ReviewChanges from "@reporting/src/app/components/changeReview/ReviewChanges";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";

interface ChangeReviewProps {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
  changes: ChangeItem[];
}

interface ChangeItem {
  field: string;
  old_value: any;
  new_value: any;
}

export default function ChangeReviewForm({
  versionId,
  initialFormData,
  navigationInformation,
  changes,
}: ChangeReviewProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<string[]>();

  const handleSubmit = async (data: FormData) => {
    const endpoint = `reporting/report-version/${versionId}`;
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
    <MultiStepWrapperWithTaskList
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
    >
      <ReviewChanges changes={changes} />
    </MultiStepWrapperWithTaskList>
  );
}
