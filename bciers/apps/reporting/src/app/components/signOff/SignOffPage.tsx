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
import { HasReportVersion } from "../../utils/defaultPageFactoryTypes";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";

const baseUrl = "/reports";
const cancelUrl = "/reports";

export default function SignOffPage({ version_id }: HasReportVersion) {
  const [formState, setFormState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const taskListElements: TaskListElement[] = getSignOffAndSubmitSteps(
    version_id,
    ActivePage.SignOff,
  );
  const backUrl = `/reports/${version_id}/final-review`;

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
          initialStep={4}
          steps={multiStepHeaderSteps}
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
          submitButtonDisabled={submitButtonDisabled}
          continueUrl={""}
          backUrl={backUrl}
        />
      )}
    </>
  );
}
