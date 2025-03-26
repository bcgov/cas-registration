"use client";
import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import {
  signOffSchema,
  signOffUiSchema,
} from "@reporting/src/data/jsonSchema/signOff/signOff";
import { IChangeEvent } from "@rjsf/core";
import { SignOffFormItems } from "@reporting/src/app/components/signOff/types";
import ReportSubmission from "@reporting/src/app/components/signOff/Success";
import { getTodaysDateForReportSignOff } from "@reporting/src/app/utils/formatDate";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import postSubmitReport from "@bciers/actions/api/postSubmitReport";
import reportValidationMessages from "./reportValidationMessages";
import { NavigationInformation } from "../taskList/types";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";

const baseUrl = "/reports";
const cancelUrl = "/reports";
interface Props extends HasReportVersion {
  navigationInformation: NavigationInformation;
}
export default function SignOffForm({
  version_id,
  navigationInformation,
}: Props) {
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState<string[]>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const allChecked = (formData: SignOffFormItems) => {
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
      const payload = safeJsonParse(JSON.stringify(formState));
      const response: any = await postSubmitReport(version_id, payload);

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
          initialStep={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
          taskListElements={navigationInformation.taskList}
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
          backUrl={navigationInformation.backUrl}
          errors={errors}
        />
      )}
    </>
  );
}
