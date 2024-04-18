"use client";

import { operationInternalUserUiSchema } from "@/app/utils/jsonSchema/operations";
import MultiStepAccordion from "@/app/components/form/MultiStepAccordion";
import { OperationsFormData } from "@/app/components/form/OperationsForm";
import { RJSFSchema } from "@rjsf/utils";

interface Props {
  formData: OperationsFormData;
  schema: RJSFSchema;
}

const OperationReviewForm = ({ formData, schema }: Props) => {
  return (
    <MultiStepAccordion
      schema={schema}
      uiSchema={operationInternalUserUiSchema}
      formData={formData}
    />
  );
};

export default OperationReviewForm;
