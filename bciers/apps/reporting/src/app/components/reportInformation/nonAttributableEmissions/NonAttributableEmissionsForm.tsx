"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import { UUID } from "crypto";
import {
  generateUpdatedSchema,
  nonAttributableEmissionUiSchema,
} from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { actionHandler } from "@bciers/actions";

const BASE_URL = "/reports";
const CANCEL_URL = "/reports";

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: UUID;
  gasTypes: { id: number; chemical_formula: string }[];
  emissionCategories: { id: number; category_name: string }[];
}

export default function NonAttributableEmissionsForm({
  versionId,
  facilityId,
  gasTypes,
  emissionCategories,
}: NonAttributableEmissionsProps) {
  const [formData, setFormData] = useState({});

  const router = useRouter();

  const SAVE_AND_CONTINUE_URL = `${BASE_URL}/${versionId}/facilities/${facilityId}/emissions-summary`;

  const schema = generateUpdatedSchema(gasTypes, emissionCategories);
  const taskListElements: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional Reporting Data",
      isActive: true,
      link: `${BASE_URL}/${versionId}/additional-reporting-data`,
    },
    {
      type: "Page",
      title: "New Entrant Information",
      link: SAVE_AND_CONTINUE_URL,
    },
  ];

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/facilities/${facilityId}/non-attributable`;
    const response = await actionHandler(endpoint, "POST", endpoint, {
      body: JSON.stringify(data),
    });

    if (response) {
      router.push(SAVE_AND_CONTINUE_URL);
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
      schema={schema}
      uiSchema={nonAttributableEmissionUiSchema}
      formData={formData}
      baseUrl={BASE_URL}
      cancelUrl={CANCEL_URL}
      onChange={(data) => setFormData(data.formData)}
      onSubmit={(data) => handleSubmit(data.formData)}
    />
  );
}
