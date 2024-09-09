"use client";

import React from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";

const baseUrl = "/reports";
const cancelUrl = "/reports";

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isChecked: true },
      { type: "Page", title: "Person responsible", isActive: true },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

export default function PersonResponsible() {
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
      schema={personResponsibleSchema}
      uiSchema={personResponsibleUiSchema}
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
