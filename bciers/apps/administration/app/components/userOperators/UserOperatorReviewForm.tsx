"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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

interface Props {
  formData: { [key: string]: any };
  operatorSchema: RJSFSchema;
}

const UserOperatorReviewForm = ({ operatorSchema, formData }: Props) => {
  const params = useParams();
  const role = useSessionRole();
  const allowApprove =
    role === FrontEndRoles.CAS_ANALYST || role === FrontEndRoles.CAS_DIRECTOR;
  const userOperatorId = params.id;
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
                  operatorId={formData?.operator_id}
                  showRequestChanges={false}
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
