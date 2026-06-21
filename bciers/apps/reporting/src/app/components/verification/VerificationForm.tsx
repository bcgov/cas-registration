"use client";
import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  baseUrlReports,
  cancelUrlReports,
} from "@reporting/src/app/utils/constants";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "../taskList/types";
import { createVerificationUISchema } from "@reporting/src/app/components/verification/createVerificationUISchema";
import { handleApiResponse } from "@reporting/src/app/utils/handleApiResponse";
import { useFormErrors } from "@reporting/src/hooks/useFormErrors";

interface Props {
  version_id: number;
  operationType: string;
  verificationSchema: RJSFSchema;
  initialData: any;
  navigationInformation: NavigationInformation;
  isSupplementaryReport: boolean;
  isEIO: boolean;
}

export default function VerificationForm({
  version_id,
  operationType,
  verificationSchema,
  initialData,
  navigationInformation,
  isSupplementaryReport,
  isEIO,
}: Props) {
  const [formData, setFormData] = useState(initialData);
  const { setErrors, renderedErrors } = useFormErrors();

  const handleChange = (e: IChangeEvent) => {
    setFormData({ ...e.formData });
  };

  const uiSchema = createVerificationUISchema(
    operationType,
    isSupplementaryReport,
    isEIO,
  );

  const handleSubmit = async () => {
    const response = await actionHandler(
      `reporting/report-version/${version_id}/report-verification`,
      "POST",
      "reporting/reports/current-reports",
      {
        body: JSON.stringify(formData),
      },
    );

    return handleApiResponse(response, setErrors);
  };

  return (
    <MultiStepFormWithTaskList
      steps={navigationInformation.headerSteps}
      initialStep={navigationInformation.headerStepIndex}
      taskListElements={navigationInformation.taskList}
      schema={verificationSchema}
      uiSchema={uiSchema}
      formData={formData}
      baseUrl={baseUrlReports}
      cancelUrl={cancelUrlReports}
      backUrl={navigationInformation.backUrl}
      onChange={handleChange as (data: object) => void}
      onSubmit={handleSubmit}
      errors={renderedErrors}
      continueUrl={navigationInformation.continueUrl}
    />
  );
}
