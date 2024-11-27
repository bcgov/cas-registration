"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";

import { actionHandler } from "@bciers/actions";
import {
  buildNewEntrantSchema,
  createNewEntrantInformationUiSchema,
} from "@reporting/src/data/jsonSchema/newEntrantInformation";
import { IChangeEvent } from "@rjsf/core";

const baseUrl = "/reports";
const cancelUrl = "/reports";

interface AdditionalReportingDataProps {
  versionId: number;
  products: [];
  initialFormData: {};
  emissions: [];
}

export default function NewEntrantInformationForm({
  versionId,
  products,
  initialFormData,
  emissions,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState(initialFormData || {});
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const router = useRouter();
  const saveAndContinueUrl = `/reports/${versionId}/compliance-summary`;
  const schema = buildNewEntrantSchema(products, emissions);
  const uiSchema = createNewEntrantInformationUiSchema(products);
  const taskListElements: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional reporting data",
      isChecked: true,
      link: `/reports/${versionId}/additional-reporting-data`,
    },
    {
      type: "Page",
      title: "New entrant information",
      isActive: true,
      link: `/reports/${versionId}/new-entrant-information`,
    },
  ];

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
    const endpoint = `reporting/report-version/${versionId}/new-entrant-data`;
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
      steps={[
        "Operation Information",
        "Report Information",
        "Additional Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={handleChange}
      onSubmit={(data) => handleSubmit(data.formData)}
      submitButtonDisabled={submitButtonDisabled}
    />
  );
}
