"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import { uiSchemaMap } from "../activities/uiSchemas/schemaMaps";
import { nonAttributableEmissionUiSchema } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { emissionAllocationUiSchema } from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { emissionSummaryUiSchema } from "@reporting/src/data/jsonSchema/emissionSummary";
import { ReviewData } from "./reviewDataFactory/factory";
import { withTheme } from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import finalReviewTheme from "./formCustomization/finalReviewTheme";
import { additionalReportingDataUiSchema } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { complianceSummaryUiSchema } from "@reporting/src/data/jsonSchema/complianceSummary";
import { useState } from "react";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
  data: ReviewData[];
  needsVerification: boolean;
}

// These uiSchemas need to be loaded on the client side, they contain interactive, stateful components.
const finalReviewSchemaMap: { [key: string]: any } = {
  ...uiSchemaMap,
  nonAttributableEmissions: nonAttributableEmissionUiSchema,
  productionData: productionDataUiSchema,
  emissionAllocation: emissionAllocationUiSchema,
  additionalReportingData: additionalReportingDataUiSchema,
  operationEmissionSummary: emissionSummaryUiSchema,
  complianceSummary: complianceSummaryUiSchema,
};

const resolveUiSchema = (uiSchema: any) => {
  if (typeof uiSchema !== "string") return uiSchema;
  return finalReviewSchemaMap[uiSchema];
};

const Form = withTheme(finalReviewTheme);

// Helper function to render the Form component
const RenderForm = ({ idx, form }: { idx: number; form: any; data: any }) => (
  <Form
    key={idx}
    schema={form.schema}
    formData={form.data}
    uiSchema={{
      ...resolveUiSchema(form.uiSchema),
      "ui:submitButtonOptions": { norender: true },
    }}
    readonly={true}
    formContext={form.context || {}}
    validator={customizeValidator({})}
  />
);

const FinalReviewForm: React.FC<Props> = ({
  version_id,
  taskListElements,
  data,
  needsVerification,
}) => {
  const router = useRouter();
  const verificationUrl = `/reports/${version_id}/verification`;
  const attachmentUrl = `/reports/${version_id}/attachment`;
  const saveAndContinueUrl = needsVerification
    ? verificationUrl
    : attachmentUrl;
  const backUrl = `/reports/${version_id}/compliance-summary`;
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submitHandler = async () => {
    setIsRedirecting(true);
    router.push(saveAndContinueUrl);
  };

  return (
    <MultiStepWrapperWithTaskList
      steps={multiStepHeaderSteps}
      initialStep={4}
      onSubmit={submitHandler}
      isRedirecting={isRedirecting}
      taskListElements={taskListElements}
      cancelUrl="#"
      backUrl={backUrl}
      continueUrl={saveAndContinueUrl}
      noFormSave={() => {}}
      submittingButtonText="Continue"
      noSaveButton
    >
      {data.map((form, idx) => {
        if (form.isCollapsible) {
          return (
            <details
              key={idx}
              className="border-2 border-t-0 border-b-0 border-[#38598A] p-2 my-2 w-full"
            >
              <summary className="cursor-pointer font-bold text-[#38598A] text-2xl py-2 border-2 border-t-0 border-b-0 border-[#38598A]">
                {form.schema.title}
              </summary>

              {/* Render items if they exist, otherwise render data */}
              {(form.items?.length ? form.items : form.data).map(
                (item: any, index: number) =>
                  RenderForm({ idx: index, form: item, data }),
              )}
            </details>
          );
        }

        return RenderForm({ idx, form, data });
      })}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
