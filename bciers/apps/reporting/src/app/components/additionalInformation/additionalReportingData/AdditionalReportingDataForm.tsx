"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useSearchParams } from "next/navigation";
import {
  additionalReportingDataSchema,
  additionalReportingDataUiSchema,
  additionalReportingDataWithElectricityGeneratedSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { actionHandler } from "@bciers/actions";

interface AdditionalReportingDataProps {
  versionId: number;
  includeElectricityGenerated: boolean;
}

interface FormData {
  captured_emissions_section: {
    purpose_note?: string;
    capture_emissions: boolean;
    capture_type?: string[];
    emissions_on_site_use?: number;
    emissions_on_site_sequestration?: number;
    emissions_off_site_transfer?: number;
  };
  additional_data_section?: {
    electricity_generated?: number;
  };
}

export default function AdditionalReportingDataForm({
  versionId,
  includeElectricityGenerated,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<FormData>({
    captured_emissions_section: {
      capture_emissions: false,
    },
  });
  // 🛸 Set up routing urls
  const searchParams = useSearchParams();
  const facilityId = searchParams.get("facility_id");
  const backUrl = `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`;
  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information`;

  const schema: RJSFSchema = includeElectricityGenerated
    ? additionalReportingDataWithElectricityGeneratedSchema
    : additionalReportingDataSchema;

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
    {
      type: "Page",
      title: "Operation emission summary",
      link: `/reports/${versionId}/operation-emission-summary`,
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

    await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });
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
      uiSchema={additionalReportingDataUiSchema}
      formData={formData}
      cancelUrl="#"
      backUrl={backUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => handleSubmit(data.formData)}
      continueUrl={saveAndContinueUrl}
    />
  );
}
