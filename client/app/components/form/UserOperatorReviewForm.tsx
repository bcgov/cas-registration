"use client";

import { useParams } from "next/navigation";

import { userOperatorInternalUserUiSchema } from "@/app/utils/jsonSchema/userOperator";
import MultiStepAccordion from "@/app/components/form/MultiStepAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import UserOperatorReview from "@/app/components/routes/access-requests/form/UserOperatorReview";

interface Props {
  formData: UserOperatorFormData;
  schema: RJSFSchema;
}

const UserOperatorReviewForm = ({ formData, schema }: Props) => {
  const params = useParams();
  const userOperatorId = params.id;
  const isNewOperator = formData.is_new;

  return (
    <>
      <MultiStepAccordion
        schema={schema}
        uiSchema={userOperatorInternalUserUiSchema}
        formData={formData}
        beforeForm={{
          "Operator Information": isNewOperator && (
            <UserOperatorReview
              userOperator={formData as UserOperatorFormData}
              userOperatorId={Number(userOperatorId)}
              note="This is a new operator. You must approve this operator before approving its admin."
              isOperatorNew={formData?.is_new}
              operatorId={formData?.operator_id}
              showRequestChanges={false}
            />
          ),
          "User Information": (
            <UserOperatorReview
              userOperator={formData as UserOperatorFormData}
              userOperatorId={Number(userOperatorId)}
              operatorId={formData?.operator_id}
              showRequestChanges={false}
            />
          ),
        }}
      />
    </>
  );
};

export default UserOperatorReviewForm;
