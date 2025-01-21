"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import {
  buildReviewFacilitiesSchema,
  reviewFacilitiesUiSchema,
} from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";
import { actionHandler } from "@bciers/actions";
import {
  getOperationInformationTaskList,
  ActivePage,
} from "@reporting/src/app/components/taskList/1_operationInformation";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";

interface Props {
  initialData: any;
  version_id: number;
}

export default function LFOFacilitiesForm({ initialData, version_id }: Props) {
  const [formData, setFormData] = useState(() => ({ ...initialData }));
  const [errors, setErrors] = useState<string[] | undefined>(undefined);
  const saveAndContinueUrl = `/reports/${version_id}/report-information`;
  const backUrl = `/reports/${version_id}/person-responsible`;

  const schema: any = buildReviewFacilitiesSchema(
    initialData.current_facilities,
    initialData.past_facilities,
  );

  const taskListElements = getOperationInformationTaskList(
    version_id,
    ActivePage.ReviewFacilities,
    "Linear Facility Operation",
  );

  const handleChange = (e: any) => {
    setFormData({ ...e.formData });
  };

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/review-facilities`;
    const method = "POST";

    try {
      const response = await actionHandler(endpoint, method, endpoint, {
        body: JSON.stringify(data),
      });

      if (response?.error) {
        setErrors([response.error]);
        return false;
      }

      setErrors(undefined);
      return true;
    } catch (err) {
      setErrors(["An unexpected error occurred."]);
      return false;
    }
  };

  return (
    <MultiStepFormWithTaskList
      formData={formData}
      schema={schema}
      uiSchema={reviewFacilitiesUiSchema}
      taskListElements={taskListElements}
      steps={multiStepHeaderSteps}
      errors={errors}
      continueUrl={saveAndContinueUrl}
      initialStep={1}
      onChange={handleChange}
      onSubmit={handleSubmit}
      backUrl={backUrl}
    />
  );
}
