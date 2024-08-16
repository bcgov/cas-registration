"use client";

import MultiStepBase from "@bciers/components/form/MultiStepBase";
import { operationRepresentativeUiSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import {
  OperationRepresentativeFormData,
  OperationRegistrationFormProps,
} from "apps/registration/app/components/operations/registration/types";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
import { contactsSchema } from "@/administration/app/data/jsonSchema/contact";
import { RJSFSchema } from "@rjsf/utils";
import { createUnnestedFormData } from "@bciers/components/form/formDataUtils";

interface OperationRepresentativeFormProps
  extends OperationRegistrationFormProps {
  formData: OperationRepresentativeFormData;
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
  const handleSubmit = async (
    operation_id: UUID,
    data: { formData?: { [key: string]: any } },
  ) => {
    // unnest the contact data
    const hasNewReps = data.formData?.new_operation_representatives.length > 0;
    let unnestedNewReps = [];
    if (hasNewReps) {
      const contactFormSections = contactsSchema.properties as RJSFSchema;
      const contactFormSectionList = Object.keys(contactFormSections);
      unnestedNewReps = data.formData?.new_operation_representatives.map(
        (representative: { [key: string]: any }) => {
          return createUnnestedFormData(representative, contactFormSectionList);
        },
      );
    }
    const endpoint = `registration/v2/operations/${operation_id}/registration/operation-representative`;
    const response = await actionHandler(endpoint, "PUT", "", {
      body: JSON.stringify({
        ...data.formData,
        ...(hasNewReps && { new_operation_representatives: unnestedNewReps }),
      }),
    });
    return response;
  };
  return (
    <>
      <MultiStepBase
        allowBackNavigation
        baseUrl={`/register-an-operation/${operation}`}
        baseUrlParams={`title=${operation}`}
        cancelUrl="/"
        formData={formData}
        onSubmit={(data) => handleSubmit(operation, data)}
        schema={schema}
        step={step}
        steps={steps}
        uiSchema={operationRepresentativeUiSchema}
        customValidate={customValidate}
      ></MultiStepBase>
    </>
  );
};

export default OperationRepresentativeForm;
