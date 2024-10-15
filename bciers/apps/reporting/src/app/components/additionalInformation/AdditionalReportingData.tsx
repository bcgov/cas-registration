"use client";

import React from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  additionalReportingDataSchema,
  additionalReportingDataUiSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";

const baseUrl = "/reports";
const cancelUrl = "/reports";

const taskListElements: TaskListElement[] = [
  {
    type: "Page",
    title: "Additional reporting data",
    isActive: true,
  },
  {
    type: "Page",
    title: "New entrant information",
  },
];

export default function AdditionalReportingData() {
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
      schema={additionalReportingDataSchema}
      uiSchema={additionalReportingDataUiSchema}
      formData={{}}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onSubmit={(data: any) => {
        return new Promise<void>((resolve) => {
          resolve(data);
        });
      }}
    />
  );
}
