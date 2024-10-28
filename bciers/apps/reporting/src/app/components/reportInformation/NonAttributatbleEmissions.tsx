"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import {
  nonAttributableEmissionSchema,
  nonAttributableEmissionUiSchema,
} from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

const baseUrl = "/reports";
const cancelUrl = "/reports";

interface AdditionalReportingDataProps {
  versionId: number;
  facilityId: UUID;
}

export default function NonAttributatbleEmissions({
  versionId,
  facilityId,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<any>({});
  const router = useRouter();

  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information`;

  const taskListElements: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional reporting data",
      isActive: true,
      link: `/reports/${versionId}/additional-reporting-data`,
    },
    {
      type: "Page",
      title: "New entrant information",
      link: `/reports/${versionId}/new-entrant-information`,
    },
  ];

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/additional-data`;
    const method = "POST";

    const payload = {
      report_version: versionId,
      ...data,
      facilityId: facilityId,
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });
    if (response) {
      router.push(`${saveAndContinueUrl}`);
    }
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={1}
      steps={[
        "Operation Information",
        "Report Information",
        "Additional Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={nonAttributableEmissionSchema}
      uiSchema={nonAttributableEmissionUiSchema}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => {
        return handleSubmit(data.formData);
      }}
    />
  );
}
