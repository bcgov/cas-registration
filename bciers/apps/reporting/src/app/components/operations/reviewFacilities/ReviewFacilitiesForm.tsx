"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import {
  reviewFacilitiesSchema,
  reviewFacilitiesUiSchema,
} from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilities";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "@reporting/src/app/components/taskList/1_operationInformation";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { Task } from "@nx/devkit";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

interface Props {
  initialData: any;
  version_id: number;
}

export default function LFOFacilitiesForm({ initialData, version_id }: Props) {
  const [formData, setFormData] = useState<any>(() => ({
    ...initialData,
  }));
  const [errors, setErrors] = useState<string[]>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [modalMessage, setModalMessage] = useState<string | null>(null);
  //const [modalTitle, setModalTitle] = useState<string | null>(null);
  //const [modalType, setModalType] = useState<"error" | "success">("success");
  const saveAndContinueUrl = "/reports/${version_id}/report-information";
  const backUrl = `/reports/${version_id}/person-responsible`;
  const taskListElements = getOperationInformationTaskList(
    version_id,
    ActivePage.ReviewFacilities,
    "Linear Facility Operation",
  );

  const handleChange = (e: any) => {
    const updatedData = { ...e.formData };
    setFormData(updatedData);
  };

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/review-facilities`;
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
      formData={formData}
      schema={reviewFacilitiesSchema}
      uiSchema={reviewFacilitiesUiSchema}
      taskListElements={taskListElements}
      steps={multiStepHeaderSteps}
      submitButtonDisabled={submitButtonDisabled}
      errors={errors}
      continueUrl={""}
      initialStep={1}
      onSubmit={handleSubmit}
    />
  );
}
