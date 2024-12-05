"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { userOperatorInternalUserUiSchema } from "@/app/utils/jsonSchema/userOperator";
import MultiStepAccordion from "@bciers/components/form/MultiStepAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/src/enums";
import UserOperatorReview from "./UserOperatorReview";

interface Props {
  formData: UserOperatorFormData;
  schema: RJSFSchema;
}

const UserOperatorReviewForm = ({ formData, schema }: Props) => {
  const params = useParams();
  const userOperatorId = params.id;
  const isNewOperator = formData.is_new;
  const isUserOperatorPending = formData.status === UserOperatorStatus.PENDING;
  const isOperatorStatusDeclined =
    formData.operator_status === OperatorStatus.DECLINED;
  const [rerenderKey, setRerenderKey] = useState(
    crypto.getRandomValues(new Uint32Array(1))[0],
  );
  const [isOperatorDeclined, setIsOperatorDeclined] = useState(
    isOperatorStatusDeclined,
  );
  console.log("schema", schema);
  return (
    <MultiStepAccordion
      schema={schema}
      // uiSchema={userOperatorInternalUserUiSchema}
      formData={formData}
      // Add Review components to the beforeForm prop
      beforeForm={{
        "User Information": !isOperatorDeclined && (
          <UserOperatorReview
            key={rerenderKey}
            userOperator={formData as UserOperatorFormData}
            userOperatorId={userOperatorId as string}
            operatorId={formData?.operator_id}
            showRequestChanges={false}
          />
        ),
      }}
      // If the operator is new, the first section should be expanded
      // If the user is pending, the second section should be expanded
      expandedSteps={{
        "Operator Information": isNewOperator,
        "User Information": isUserOperatorPending && !isOperatorDeclined,
      }}
    />
  );
};

export default UserOperatorReviewForm;
