"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ComponentAccordion from "@bciers/components/form/ComponentAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/src/enums";
import UserOperatorReview from "./UserOperatorReview";
import {
  userOperatorInternalUserSchema,
  userOperatorInternalUserUiSchema,
  userOperatorUserInformationPage2,
} from "../../data/jsonSchema/userOperator";
import OperatorForm from "../operators/OperatorForm";
import { operatorSchema } from "../../data/jsonSchema/operator";
import FormBase from "@bciers/components/form/FormBase";

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
  return (
    <ComponentAccordion
      content={[
        {
          title: "Operation Information",
          component: (
            <OperatorForm
              showTasklist={false}
              schema={operatorSchema}
              formData={formData}
              isCreating={false}
              isInternalUser={true}
            />
          ),
        },
        {
          title: "Admin Information",
          component: (
            <>
              <UserOperatorReview
                key={rerenderKey}
                userOperator={formData as UserOperatorFormData}
                userOperatorId={userOperatorId as string}
                operatorId={formData?.operator_id}
                showRequestChanges={false}
              />
              <FormBase
                schema={userOperatorUserInformationPage2}
                uiSchema={userOperatorInternalUserUiSchema}
                formData={formData}
                disabled
                // Pass children as prop so RJSF doesn't render submit button
                // eslint-disable-next-line react/no-children-prop
                children
              />
            </>
          ),
        },
      ]} // If the operator is new, the first section should be expanded
      // If the user is pending, the second section should be expanded
      expandedSteps={{
        "Operator Information": isNewOperator,
        "Admin Information": isUserOperatorPending && !isOperatorDeclined,
      }}
    />
  );
};

export default UserOperatorReviewForm;
