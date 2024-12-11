"use client";

import { useState } from "react";
import ComponentAccordion from "@bciers/components/form/ComponentAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import UserOperatorReview from "./UserOperatorReview";
import {
  userOperatorAdministrationSchema,
  userOperatorAdministrationUiSchema,
} from "../../data/jsonSchema/userOperator";
import OperatorForm from "../operators/OperatorForm";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import { UUID } from "crypto";

interface Props {
  formData: { [key: string]: any };
  operatorSchema: RJSFSchema;
  userOperatorId: UUID;
}

const UserOperatorReviewForm = ({
  operatorSchema,
  formData,
  userOperatorId,
}: Props) => {
  const role = useSessionRole();
  const allowApprove =
    role === FrontEndRoles.CAS_ANALYST || role === FrontEndRoles.CAS_DIRECTOR;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              {allowApprove && (
                <UserOperatorReview
                  key={rerenderKey}
                  userOperator={formData as UserOperatorFormData}
                  userOperatorId={userOperatorId as string}
                />
              )}
              <FormBase
                schema={userOperatorAdministrationSchema}
                uiSchema={userOperatorAdministrationUiSchema}
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
