"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import {
  additionalReportingDataSchema,
  additionalReportingDataUiSchema,
  additionalReportingDataWithElectricityGeneratedSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { actionHandler } from "@bciers/actions";
import { useSearchParams } from "next/navigation";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import {
  ActivePage,
  getAdditionalInformationTaskList,
} from "../../taskList/3_additionalInformation";

interface AdditionalReportingDataProps {
  versionId: number;
  includeElectricityGenerated: boolean;
  initialFormData: any;
  isNewEntrant: boolean;
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
  initialFormData,
  isNewEntrant,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>();

  // 🛸 Set up routing urls
  const searchParams = useSearchParams();
  const facilityId = searchParams.get("facility_id");
  const backUrl = `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`;
  const saveAndContinueUrl = isNewEntrant
    ? `new-entrant-information`
    : `compliance-summary`;

  const schema: RJSFSchema = includeElectricityGenerated
    ? additionalReportingDataWithElectricityGeneratedSchema
    : additionalReportingDataSchema;

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

    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    setErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={2}
      steps={multiStepHeaderSteps}
      taskListElements={getAdditionalInformationTaskList(
        versionId,
        ActivePage.AdditionalReportingData,
        isNewEntrant,
      )}
      schema={schema}
      uiSchema={additionalReportingDataUiSchema}
      formData={formData}
      backUrl={backUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => handleSubmit(data.formData)}
      continueUrl={saveAndContinueUrl}
      errors={errors}
    />
  );
}
