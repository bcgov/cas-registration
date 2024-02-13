"use client";

import { userOperatorInternalUserUiSchema } from "@/app/utils/jsonSchema/userOperator";
import MultiStepAccordion from "@/app/components/form/MultiStepAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";

interface Props {
  formData: UserOperatorFormData;
  schema: RJSFSchema;
}

const UserOperatorReviewForm = ({ formData, schema }: Props) => {
  return (
    <MultiStepAccordion
      schema={schema}
      uiSchema={userOperatorInternalUserUiSchema}
      formData={formData}
    />
  );
};

export default UserOperatorReviewForm;
