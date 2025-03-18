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
  const isUserOperatorPending = formData.status === UserOperatorStatus.PENDING;
  const isOperatorStatusDeclined =
    formData.operator_status === OperatorStatus.DECLINED;
  const [rerenderKey, setRerenderKey] = useState(
    crypto.getRandomValues(new Uint32Array(1))[0],
  );
  const [isOperatorDeclined, setIsOperatorDeclined] = useState(
    isOperatorStatusDeclined,
  );

  return (
    <MultiStepAccordion
      schema={schema}
      uiSchema={userOperatorInternalUserUiSchema}
      formData={formData}
      // Add Review components to the beforeForm prop
      beforeForm={{
        "Operator Information": (
          <UserOperatorReview
            userOperator={formData as UserOperatorFormData}
            userOperatorId={userOperatorId as string}
            // Set Operator Declined to true if the operator is declined
            // So that we can hide the Prime Admin Review component
            onDecline={() => setIsOperatorDeclined(true)}
            // Set rerenderKey to a new random value to force a rerender when the operator is approved
            // So that we can reset the prime admin review if there was an error ie: operator needs to be approved first
            onSuccess={() =>
              setRerenderKey(crypto.getRandomValues(new Uint32Array(1))[0])
            }
            note="This is a new operator. You must approve this operator before approving its admin."
            operatorId={formData?.operator_id}
            showRequestChanges={false}
          />
        ),
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
      // The first section should always be expanded
      // If the user is pending, the second section should be expanded
      expandedSteps={{
        "Operator Information": true,
        "User Information": isUserOperatorPending && !isOperatorDeclined,
      }}
    />
  );
};

export default UserOperatorReviewForm;
