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
import postSubmitReport from "@bciers/actions/api/postSubmitReport";
import { RJSFSchema } from "@rjsf/utils";
import { signOffUiSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";

interface Props extends HasReportVersion {
  navigationInformation: NavigationInformation;
  schema: RJSFSchema;
}
export default function SignOffForm({
  version_id,
  navigationInformation,
  schema,
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
        acknowledgements: {
          ...rest,
          ...supplementary,
        },
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
      uiSchema={signOffUiSchema}
      formData={formState}
      onSubmit={handleSubmit}
      buttonText={"Submit Report"}
      onChange={handleChange}
      saveButtonDisabled={true}
      submitButtonDisabled={submitButtonDisabled}
      continueUrl={navigationInformation.continueUrl}
      backUrl={navigationInformation.backUrl}
      errors={errors}
    />
  );
}
