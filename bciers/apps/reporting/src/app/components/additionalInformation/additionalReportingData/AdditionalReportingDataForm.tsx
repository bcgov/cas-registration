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
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { handleApiResponse } from "@reporting/src/app/utils/handleApiResponse";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";

interface AdditionalReportingDataProps {
  versionId: number;
  includeElectricityGenerated: boolean;
  initialFormData: any;
  navigationInformation: NavigationInformation;
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
  navigationInformation,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { setErrors, renderedErrors } = useFormErrors();

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

    return handleApiResponse(response, setErrors);
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={additionalReportingDataUiSchema}
      formData={formData}
      backUrl={navigationInformation.backUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => handleSubmit(data.formData)}
      continueUrl={navigationInformation.continueUrl}
      errors={renderedErrors}
    />
  );
}
