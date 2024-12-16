"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";

import { actionHandler } from "@bciers/actions";
import {
  NewEntrantSchema,
  NewEntrantUiSchema,
} from "@reporting/src/data/jsonSchema/newEntrantInformation";
import { IChangeEvent } from "@rjsf/core";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";

const baseUrl = "/reports";
const cancelUrl = "/reports";

interface NewEntrantInfornationProps {
  version_id: number;
  initialFormData: { assertion_statement?: boolean };
  taskListElements: TaskListElement[];
}

export default function NewEntrantInformationForm({
  version_id,
  initialFormData,
  taskListElements,
}: NewEntrantInfornationProps) {
  const [formData, setFormData] = useState(initialFormData || {});
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(
    !initialFormData.assertion_statement,
  );

  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/compliance-summary`;

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
    if (response) {
      router.push(saveAndContinueUrl);
    }
  };
  return (
    <MultiStepFormWithTaskList
      initialStep={2}
      steps={multiStepHeaderSteps}
      taskListElements={taskListElements}
      schema={NewEntrantSchema}
      uiSchema={NewEntrantUiSchema}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={handleChange}
      onSubmit={(data) => handleSubmit(data.formData)}
      submitButtonDisabled={submitButtonDisabled}
      formContext={formData}
      continueUrl={saveAndContinueUrl}
    />
  );
}
