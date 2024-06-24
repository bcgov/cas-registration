"use client";

import { operationInternalUserUiSchema } from "@bciers/utils/server";
import MultiStepAccordion from "@bciers/components/form/MultiStepAccordion";
import { RJSFSchema } from "@rjsf/utils";
import { OperationsFormData } from "./OperationsForm";

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
