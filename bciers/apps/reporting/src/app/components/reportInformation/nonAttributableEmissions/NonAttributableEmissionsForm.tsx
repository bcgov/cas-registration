"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  generateUpdatedSchema,
  nonAttributableEmissionUiSchema,
} from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

export interface GasType {
  id: number;
  chemical_formula: string;
}

export interface EmissionCategory {
  id: number;
  category_name: string;
}

export interface NonAttributableEmissionRecord {
  id: number;
  activity: string;
  source_type: string;
  emission_category: string;
  gas_type: string[];
}

interface ActivityFormItem {
  id?: number;
  activity?: string;
  source_type?: string;
  emission_category?: string;
  gas_type: string[];
}

interface NonAttributableFormData {
  emissions_exceeded: boolean;
  activities: ActivityFormItem[];
}

interface NonAttributableEmissionsFormProps {
  versionId: number;
  facilityId: string;
  emissionFormData: {
    emissions_exceeded: boolean;
    activities: NonAttributableEmissionRecord[];
  };
  gasTypes: GasType[];
  emissionCategories: EmissionCategory[];
  navigationInformation: NavigationInformation;
}

export default function NonAttributableEmissionsForm({
  versionId,
  facilityId,
  emissionFormData,
  gasTypes,
  emissionCategories,
  navigationInformation,
}: NonAttributableEmissionsFormProps) {
  const [validationErrors, setValidationErrors] =
    useState<ReportValidationErrors>();
  const [formData, setFormData] = useState<NonAttributableFormData>({
    emissions_exceeded: emissionFormData.emissions_exceeded,
    // Seed one empty row so the form renders a first entry when the user switches to "Yes",
    // since RJSF does not auto-populate array rows inside a conditional schema branch.
    activities:
      emissionFormData.activities.length > 0
        ? emissionFormData.activities
        : [{ gas_type: [] }],
  });

  const schema = generateUpdatedSchema(gasTypes, emissionCategories);

  const handleSubmit = async () => {
    const endpoint = `reporting/report-version/${versionId}/facilities/${facilityId}/non-attributable`;
    const pathToRevalidate = `reporting/reports/${versionId}/facilities/${facilityId}/non-attributable`;
    const response = await actionHandler(endpoint, "POST", pathToRevalidate, {
      body: JSON.stringify(formData),
    });

    if (response?.validation?.errors) {
      setValidationErrors(response.validation.errors);
      return false;
    }

    if (response?.error) {
      setValidationErrors([createGenericReportValidationError(response.error)]);
      return false;
    }
    setValidationErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={nonAttributableEmissionUiSchema}
      formData={formData}
      cancelUrl="#"
      onChange={(data) =>
        setFormData((data as { formData: NonAttributableFormData }).formData)
      }
      onSubmit={handleSubmit}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      errors={[<ReportValidationSummary errors={validationErrors} />]}
    />
  );
}
