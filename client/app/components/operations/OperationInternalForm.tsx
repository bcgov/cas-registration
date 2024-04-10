"use client";

import { operationInternalUserUiSchema } from "@/app/utils/jsonSchema/operations";
import MultiStepAccordion from "@/app/components/form/MultiStepAccordion";
import { RJSFSchema } from "@rjsf/utils";
import { OperationsFormData } from "./OperationExternalForm";

interface Props {
  formData: OperationsFormData;
  schema: RJSFSchema;
}

const OperationInternalForm = ({ formData, schema }: Props) => {
  return (
    <MultiStepAccordion
      schema={schema}
      uiSchema={operationInternalUserUiSchema}
      formData={formData}
    />
  );
};

export default OperationInternalForm;
