"use client";

import React, { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

import {
  additionalReportingDataUiSchema,
  baseSchema,
  conditionalFields,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";

const baseUrl = "/reports";
const cancelUrl = "/reports";

const taskListElements: TaskListElement[] = [
  { type: "Page", title: "Additional reporting data", isActive: true },
  { type: "Page", title: "New entrant information" },
];

export default function AdditionalReportingData() {
  const [formSchema, setFormSchema] = useState<RJSFSchema>(baseSchema);
  const [formData, setFormData] = useState<any>({});

  const handleRadioChange = (data: any) => {
    const isCaptureEmissions = data.capture_emissions === true;

    // Update schema based on radio button value
    const updatedSchema: RJSFSchema = {
      ...baseSchema,
      properties: {
        ...baseSchema.properties,
        ...(isCaptureEmissions ? conditionalFields : {}),
      },
    };

    // Ensure formData reflects the current selection
    const updatedFormData = {
      ...data,
      ...(!isCaptureEmissions && {
        capture_type: undefined,
        emissions_on_site_use: undefined,
        emissions_on_site_sequestration: undefined,
        emissions_off_site_transfer: undefined,
        electricity_generated: undefined,
      }),
    };

    setFormSchema(updatedSchema);
    setFormData(updatedFormData);
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={0}
      steps={[
        "Operation Information",
        "Facilities Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={formSchema}
      uiSchema={additionalReportingDataUiSchema}
      formData={formData} // Pass the updated formData to the component
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData); // Sync formData on every change
        handleRadioChange(data.formData);
      }}
      onSubmit={(data: any) =>
        new Promise<void>((resolve) => {
          resolve(data);
        })
      }
    />
  );
}
