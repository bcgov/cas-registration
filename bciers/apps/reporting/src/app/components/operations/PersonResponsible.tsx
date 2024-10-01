"use client";

import React, { useEffect } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import {
  personResponsibleSchema,
  personResponsibleUiSchema,
} from "@reporting/src/data/jsonSchema/personResponsible";
import { useFormContext } from "@reporting/src/app/bceidbusiness/industry_user_admin/reports/[version_id]/FormContext";
import taskList from "@bciers/components/form/components/TaskList";

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
  const {
    formData,
    setFormData,
    setFormUiSchema,
    setFormSchema,
    setFormSubmitHandler,
    setTaskList,
  } = useFormContext();

  useEffect(() => {
    setFormSchema(personResponsibleSchema);
    setFormUiSchema(personResponsibleUiSchema);
    setTaskList(taskListElements);
  }, []);

  return null;
}
