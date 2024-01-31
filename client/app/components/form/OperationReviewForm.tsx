"use client";

import { operationInternalUserUiSchema } from "@/app/utils/jsonSchema/operations";
import MultiStepAccordion from "@/app/components/form/MultiStepAccordion";

interface Props {
  formData: any;
  schema: any;
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
