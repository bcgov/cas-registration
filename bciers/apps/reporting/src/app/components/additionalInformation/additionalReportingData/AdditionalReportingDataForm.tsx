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
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { OperationTypes } from "@bciers/utils/src/enums";

interface AdditionalReportingDataProps {
  versionId: number;
  includeElectricityGenerated: boolean;
  initialFormData: any;
  isNewEntrant: boolean;
  taskListElements: TaskListElement[];
  operationType: string;
  facilityId: string;
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
  taskListElements,
  operationType,
  facilityId,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<string[]>();

  const backUrl = `/reports/${versionId}/facilities/${facilityId}/allocation-of-emissions`;
  const saveAndContinueUrl = isNewEntrant
    ? `new-entrant-information`
    : operationType === OperationTypes.LFO
    ? "operation-emission-summary"
    : "compliance-summary";

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
      taskListElements={taskListElements}
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
