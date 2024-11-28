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

interface ActivityData {
  id: number;
  activity: string;
  source_type: string;
  emission_category: number;
  gas_type: number[];
}

interface NonAttributableEmissionsProps {
  versionId: number;
  facilityId: UUID;
  emissionFormData: ActivityData[]; // Define emissionFormData as an array of ActivityData
  gasTypes: { id: number; chemical_formula: string }[];
  emissionCategories: { id: number; category_name: string }[];
  gasTypeMap: Record<number, string>;
  emissionCategoryMap: Record<number, string>;
}

export default function NonAttributableEmissionsForm({
  versionId,
  facilityId,
  emissionFormData,
  gasTypes,
  emissionCategories,
  gasTypeMap,
  emissionCategoryMap,
}: NonAttributableEmissionsProps & {
  gasTypeMap: Record<number, string>;
  emissionCategoryMap: Record<number, string>;
}) {
  const [formData, setFormData] = useState(
    emissionFormData.length
      ? {
          activities: emissionFormData.map((item) => ({
            id: item.id,
            activity: item.activity,
            source_type: item.source_type,
            emission_category: emissionCategoryMap[item.emission_category],
            gas_type: item.gas_type.map((id) => gasTypeMap[id]),
          })),
          emissions_exceeded: true,
        }
      : {
          activities: [
            {
              activity: "",
              source_type: "",
              gas_type: [],
              emission_category: "",
            },
          ],
          emissions_exceeded: false,
        },
  );

  const router = useRouter();

  const SAVE_AND_CONTINUE_URL = `${BASE_URL}/${versionId}/facilities/${facilityId}/emissions-summary`;
  const CONTINUE_URL = `emission-summary`;
  const BACK_URL = `activities?step=-1`;

  const schema = generateUpdatedSchema(gasTypes, emissionCategories);
  const taskListElements: TaskListElement[] = [
    {
      type: "Section",
      title: "Facility1 Information",
      isExpanded: true,
      elements: [
        {
          type: "Section",
          title: "Activities Information",
          elements: [
            { type: "Page", title: "General stationary combustion" },
            { type: "Page", title: "Mobile Combustion" },
            { type: "Page", title: "Cement Production" },
          ],
        },
        { type: "Page", title: "Non-attributable emissions", isActive: true },
        { type: "Page", title: "Emissions summary" },
        { type: "Page", title: "Production Data" },
        { type: "Page", title: "Allocations of emissions" },
      ],
    },
  ];

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${versionId}/facilities/${facilityId}/non-attributable`;
    const response = await actionHandler(endpoint, "POST", endpoint, {
      body: JSON.stringify(formData),
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
      onSubmit={() => handleSubmit()}
      backUrl={BACK_URL}
      continueUrl={CONTINUE_URL}
    />
  );
}
