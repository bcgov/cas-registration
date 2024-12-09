"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ComponentAccordion from "@bciers/components/form/ComponentAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/src/enums";
import UserOperatorReview from "./UserOperatorReview";
import {
  userOperatorInternalUserUiSchema,
  userOperatorUserInformationPage2,
} from "../../data/jsonSchema/userOperator";
import OperatorForm from "../operators/OperatorForm";
import FormBase from "@bciers/components/form/FormBase";
import { createOperatorSchema } from "../../data/jsonSchema/operator";

interface Props {
  formData: UserOperatorFormData;
  schema: RJSFSchema;
}

const UserOperatorReviewForm = async ({ formData, schema }: Props) => {
  const params = useParams();
  const userOperatorId = params.id;
  const isOperatorStatusDeclined =
    formData.operator_status === OperatorStatus.DECLINED;
  const [rerenderKey, setRerenderKey] = useState(
    crypto.getRandomValues(new Uint32Array(1))[0],
  );

  return (
    <ComponentAccordion
      content={[
        {
          title: "Operation Information",
          component: (
            <OperatorForm
              showTasklist={false}
              schema={await createOperatorSchema()}
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
      ]}
    />
  );
};

export default UserOperatorReviewForm;
