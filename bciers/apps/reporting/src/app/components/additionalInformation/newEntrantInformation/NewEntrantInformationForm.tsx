"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";

import { actionHandler } from "@bciers/actions";
import {
  createNewEntrantInformationSchema,
  createNewEntrantInformationUiSchema,
} from "@reporting/src/data/jsonSchema/newEntrantInformation";

const baseUrl = "/reports";
const cancelUrl = "/reports";

interface AdditionalReportingDataProps {
  versionId: number;
  products: [];
}

export default function NewEntrantInformationForm({
  versionId,
  products,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<FormData>();

  const router = useRouter();
  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information`;

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

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/additional-data`;
    const method = "POST";

    const payload = {
      report_version: versionId,
      ...data.captured_emissions_section,
      ...data.additional_data_section,
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
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
      schema={createNewEntrantInformationSchema(products)}
      uiSchema={createNewEntrantInformationUiSchema(products)}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => handleSubmit(data.formData)}
    />
  );
}
