"use client";

import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { IChangeEvent } from "@rjsf/core";
import { getTodaysDateForReportSignOff } from "@reporting/src/app/utils/formatDate";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { useRouter } from "next/navigation";
import postSubmitReport from "@bciers/actions/api/postSubmitReport";
import { RJSFSchema } from "@rjsf/utils";
import { signOffUiSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

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

  const [validationErrors, setValidationErrors] =
    useState<ReportValidationErrors>([]);

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };

    if (e.formData.signature) {
      updatedData.date = getTodaysDateForReportSignOff();
    }

    setFormState(updatedData);
  };

  const handleSubmit = async () => {
    setValidationErrors([]);

    const response = await postSubmitReport(version_id, formState);

    if (response?.validation || response?.payload?.errors) {
      setValidationErrors(
        response.validation?.errors ?? response.payload.errors,
      );
      return false;
    }

    if (response?.error) {
      setValidationErrors([
        createGenericReportValidationError(response.error as string),
      ]);
      return false;
    }

    router.push(navigationInformation.continueUrl);

    return true;
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
      onChange={handleChange as (data: object) => void}
      saveButtonDisabled={true}
      continueUrl={navigationInformation.continueUrl}
      backUrl={navigationInformation.backUrl}
      errors={[
        <ReportValidationSummary
          key="report-validation-summary" // gitleaks:allow
          errors={validationErrors}
        />,
      ]}
    />
  );
}
