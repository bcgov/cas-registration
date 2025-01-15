"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import {
  operationReviewSchema,
  operationReviewUiSchema,
  updateSchema,
} from "@reporting/src/data/jsonSchema/operations";
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
    Initialdata: any;
    version_id: number;
    taskListElements: TaskListElement[];
}

export default function ReviewFacilitiesForm({
  Initialdata,
  version_id,
  taskListElements,
}: Props) {
  const [formData, setFormData] = useState<any>(() => ({
    ...Initialdata,
  }));
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [uiSchema, setUiSchema] = useState(operationReviewUiSchema);
  const [errors, setErrors] = useState<string[]>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [modalMessage, setModalMessage] = useState<string | null>(null);
  //const [modalTitle, setModalTitle] = useState<string | null>(null);
  //const [modalType, setModalType] = useState<"error" | "success">("success");

  const saveAndContinueUrl = `/reports/${version_id}/compliance-summary`;

  const handleChange = (e: any) => {
    const updatedData = { ...e.formData };
    setFormData(updatedData);
  };

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/selected-facilities`;
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
      schema={schema}
      uiSchema={uiSchema}
      taskListElements={taskListElements}
      headerSteps={multiStepHeaderSteps}
      saveAndContinueUrl={saveAndContinueUrl}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      submitButtonDisabled={submitButtonDisabled}
      errors={errors}
    />
  );
}
