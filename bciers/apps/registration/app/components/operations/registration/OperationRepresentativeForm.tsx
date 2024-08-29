"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { operationRepresentativeUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  OperationRepresentativeFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
import { contactsSchema } from "@/administration/app/data/jsonSchema/contact";
import { RJSFSchema } from "@rjsf/utils";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";
import { useState } from "react";

interface OperationRepresentativeFormProps
  extends OperationRegistrationFormProps {
  formData: OperationRepresentativeFormData | {};
}

function customValidate(
  formData: { [key: string]: any },
  errors: { [key: string]: any },
) {
  if (
    formData.operation_representatives.length < 1 &&
    formData.new_operation_representatives.length < 1
  ) {
    errors.operation_representatives.addError(
      "You must select or add at least one representative",
    );
  }
  return errors;
}

const OperationRepresentativeForm = ({
  formData,
  operation,
  schema,
  step,
  steps,
}: OperationRepresentativeFormProps) => {
  const [error, setError] = useState(undefined);
  const handleSubmit = async (e: IChangeEvent) => {
    // unnest the contact data
    const hasNewReps = e.formData?.new_operation_representatives.length > 0;
    let unnestedNewReps = [];
    if (hasNewReps) {
      const contactFormSections = contactsSchema.properties as RJSFSchema;
      const contactFormSectionList = Object.keys(contactFormSections);
      unnestedNewReps = e.formData?.new_operation_representatives.map(
        (representative: { [key: string]: any }) => {
          return createUnnestedFormData(representative, contactFormSectionList);
        },
      );
    }
    const endpoint = `registration/v2/operations/${operation}/registration/operation-representative`;
    const response = await actionHandler(endpoint, "PUT", "", {
      body: JSON.stringify({
        ...e.formData,
        ...(hasNewReps && { new_operation_representatives: unnestedNewReps }),
      }),
    });
    if (!response || response?.error) {
      setError(response.error);
      return { error: response.error };
    }
  };
  return (
    <MultiStepBase
      allowBackNavigation
      baseUrl={`/register-an-operation/${operation}`}
      baseUrlParams={`title=${operation}`}
      cancelUrl="/"
      formData={formData}
      onSubmit={handleSubmit}
      schema={schema}
      step={step}
      error={error}
      steps={steps}
      uiSchema={operationRepresentativeUiSchema}
      customValidate={customValidate}
    />
  );
};

export default OperationRepresentativeForm;
