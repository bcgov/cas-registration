"use client";

import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  signOffSchema,
  signOffUiSchema,
} from "@reporting/src/data/jsonSchema/signOff/signOff";
import { IChangeEvent } from "@rjsf/core";
import { SignOffFormData } from "@reporting/src/app/components/signOff/types";
import ReportSubmission from "@reporting/src/app/components/signOff/Success";
import { getTodaysDateForReportSignOff } from "@reporting/src/app/utils/formatDate";
import { HasReportVersion } from "../../utils/defaultPageFactoryTypes";
import postSubmitReport from "@bciers/actions/api/postSubmitReport";
import reportValidationMessages from "./reportValidationMessages";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "../taskList/5_signOffSubmit";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";

const baseUrl = "/reports";
const cancelUrl = "/reports";

export default function SignOffPage({ version_id }: HasReportVersion) {
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState<string[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

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
      const response: any = await postSubmitReport(version_id);

      if (response?.error) {
        setErrors([reportValidationMessages[response.error]]);
        return false;
      }
      setErrors(undefined);
      setIsSubmitting(true);
      setSubmitButtonDisabled(true);
    }

    return true;
  };

  return (
    <>
      {isSubmitting ? (
        <ReportSubmission />
      ) : (
        <MultiStepFormWithTaskList
          initialStep={3}
          steps={multiStepHeaderSteps}
          taskListElements={getSignOffAndSubmitSteps(
            version_id,
            ActivePage.SignOff,
          )}
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
          backUrl={backUrl}
          errors={errors}
        />
      )}
    </>
  );
}
