"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import MultiStepAccordion from "@bciers/components/form/MultiStepAccordion";
import { UserOperatorFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/src/enums";
import UserOperatorReview from "./UserOperatorReview";
import { userOperatorInternalUserUiSchema } from "../../data/jsonSchema/userOperator";
import Accordion from "@bciers/components/accordion/Accordion";
import OperatorForm from "../operators/OperatorForm";
import { operatorSchema } from "../../data/jsonSchema/operator";

interface Props {
  formData: UserOperatorFormData;
  schema: RJSFSchema;
}

const UserOperatorReviewForm = ({ formData, schema }: Props) => {
  const params = useParams();
  const userOperatorId = params.id;
  const isUserOperatorPending = formData.status === UserOperatorStatus.PENDING;
  const [rerenderKey, setRerenderKey] = useState(
    crypto.getRandomValues(new Uint32Array(1))[0],
  );
  const schemaTitle = "rainbow unicorn";
  console.log("formdata", formData);
  console.log("schema", schema);
  const expandedSteps = {
    "Operator Information": isUserOperatorPending,
    "Admin Information": isUserOperatorPending,
  };
  const isExpanded =
    expandedSteps && schemaTitle && expandedSteps[schemaTitle] ? true : false;

  const [expandAll, setExpandAll] = useState({ isExpandAll: false });
  const accordionSectionList = Object.keys(schema.properties as any);

  if (accordionSectionList.length === 0) return null;

  // spread previous state so it's saved in a new memory location to trigger a re-render
  // This was needed because the buttons wouldn't work correctly when the same value was passed
  // if a user opened a single accordion and then clicked "Collapse All"
  const handleExpandAll = () => {
    setExpandAll({ ...expandAll, isExpandAll: true });
  };

  const handleCollapseAll = () => {
    setExpandAll({ ...expandAll, isExpandAll: false });
  };
  return (
    <Accordion
      key={"d"}
      expanded={isExpanded}
      expandedOptions={expandAll}
      title={schemaTitle}
    >
      <OperatorForm
        showTasklist={false}
        schema={operatorSchema}
        formData={formData}
        isCreating={false}
        isInternalUser={true}
      />
      {/* {isBeforeForm}
      <FormBase
        schema={schema.properties ? schemaSection : {}}
        uiSchema={uiSchema}
        formData={formData}
        disabled
        // Pass children as prop so RJSF doesn't render submit button
        // eslint-disable-next-line react/no-children-prop
        children
      /> */}
    </Accordion>

    // <MultiStepAccordion
    //   schema={schema}
    //   uiSchema={userOperatorInternalUserUiSchema}
    //   formData={formData}
    //   // Add Review components to the beforeForm prop
    //   beforeForm={{
    //     "Admin Information": (
    //       <UserOperatorReview
    //         key={rerenderKey}
    //         userOperator={formData as UserOperatorFormData}
    //         userOperatorId={userOperatorId as string}
    //         operatorId={formData?.operator_id}
    //         showRequestChanges={false}
    //       />
    //     ),
    //   }}
    //   // If the admin still needs to be approved, sections are expanded
    //   expandedSteps={{
    //     "Operator Information": isUserOperatorPending,
    //     "Admin Information": isUserOperatorPending,
    //   }}
    // />
  );
};

export default UserOperatorReviewForm;
