"use client";

import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  signOffSchema,
  signOffUiSchema,
} from "@reporting/src/data/jsonSchema/signOff/signOff";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IChangeEvent } from "@rjsf/core";
import { SignOffFormData } from "@reporting/src/app/components/signOff/types";
import ReportSubmission from "@reporting/src/app/components/signOff/Success";
import { getTodaysDateForReportSignOff } from "@reporting/src/app/utils/formatDate";
const baseUrl = "/reports";
const cancelUrl = "/reports";

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Sign-off & Submit",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Verification" },
      { type: "Page", title: "Confidentiality request" },
      { type: "Page", title: "Attachments" },
      { type: "Page", title: "Final review" },
      { type: "Page", title: "Sign-off", isActive: true },
    ],
  },
];

export default function SignOffPage() {
  const [formState, setFormState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const allChecked = (formData: SignOffFormData) => {
    return Object.values(formData).every((value) => value);
  };

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };
    if (e.formData.signature) {
      updatedData.date = getTodaysDateForReportSignOff();
    }

    setFormState(updatedData);
    setSubmitButtonDisabled(!allChecked(updatedData));
  };

  const handleSubmit = async () => {
    if (!submitButtonDisabled) {
      setIsSubmitting(true);
      setSubmitButtonDisabled(true);
    }
  };

  return (
    <>
      {isSubmitting ? (
        <ReportSubmission />
      ) : (
        <MultiStepFormWithTaskList
          initialStep={3}
          steps={[
            "Operation Information",
            "Facilities Information",
            "Compliance Summary",
            "Sign-off & Submit",
          ]}
          taskListElements={taskListElements}
          schema={signOffSchema}
          uiSchema={signOffUiSchema}
          formData={formState}
          baseUrl={baseUrl}
          cancelUrl={cancelUrl}
          onSubmit={handleSubmit}
          buttonText={"Submit Report"}
          onChange={handleChange}
          saveButtonDisabled={true}
          submitButtonDisabled={submitButtonDisabled} // Disable button if not all checkboxes are checked
          continueUrl={""}
        />
      )}
    </>
  );
}
