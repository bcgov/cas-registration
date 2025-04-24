"use client";
import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { IChangeEvent } from "@rjsf/core";
import { SignOffFormItems } from "@reporting/src/app/components/signOff/types";
import { getTodaysDateForReportSignOff } from "@reporting/src/app/utils/formatDate";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { getValidationErrorMessage } from "@reporting/src/app/utils/reportValidationMessages";
import { useRouter } from "next/navigation";
import { createSignOffUiSchema } from "@reporting/src/app/components/signOff/createSignOffUiSchema";
import { createSignOffSchema } from "@reporting/src/app/components/signOff/createSignOffSchema";
import postSubmitReport from "@bciers/actions/api/postSubmitReport";

interface Props extends HasReportVersion {
  navigationInformation: NavigationInformation;
  isRegulatedOperation: boolean;
  isSupplementaryReport: boolean;
}
export default function SignOffForm({
  version_id,
  navigationInformation,
  isRegulatedOperation,
  isSupplementaryReport,
}: Props) {
  const router = useRouter();
  const [formState, setFormState] = useState({
    acknowledgements: {},
    signature: "",
    date: "",
    supplementary: {},
  });
  const [errors, setErrors] = useState<string[]>();
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);

  const allChecked = (formData: SignOffFormItems) => {
    const { supplementary, signature, ...rest } = formData;
    return (
      !!signature && Object.values({ ...rest, ...supplementary }).every(Boolean)
    );
  };
  const uiSchema = createSignOffUiSchema(
    isSupplementaryReport,
    isRegulatedOperation,
  );
  const schema = createSignOffSchema(
    isSupplementaryReport,
    isRegulatedOperation,
  );

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
      setErrors(undefined);
      setSubmitButtonDisabled(true);

      const { supplementary = {}, signature, date, ...rest } = formState;

      const payload = {
        ...rest,
        ...supplementary,
        signature,
        date,
      };
      const response: any = await postSubmitReport(version_id, payload);
      setSubmitButtonDisabled(false);

      if (response?.error) {
        setErrors([getValidationErrorMessage(response.error)]);
        setSubmitButtonDisabled(false);
        return false;
      }
      router.push(navigationInformation.continueUrl);
      return true;
    }
    return false;
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      schema={schema}
      uiSchema={uiSchema}
      formData={formState}
      onSubmit={handleSubmit}
      buttonText={"Submit Report"}
      onChange={handleChange}
      saveButtonDisabled={true}
      submitButtonDisabled={submitButtonDisabled} // Disable button if not all checkboxes are checked
      continueUrl={navigationInformation.continueUrl}
      backUrl={navigationInformation.backUrl}
      errors={errors}
    />
  );
}
