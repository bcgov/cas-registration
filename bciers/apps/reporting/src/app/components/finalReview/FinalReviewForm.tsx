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
import { ReviewData } from "./reviewDataFactory/factory";
import { withTheme } from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import finalReviewTheme from "./formCustomization/finalReviewTheme";
import { additionalReportingDataUiSchema } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
  data: ReviewData[];
}

// D
const finalReviewSchemaMap: { [key: string]: any } = {
  ...uiSchemaMap,
  nonAttributableEmissions: nonAttributableEmissionUiSchema,
  productionData: productionDataUiSchema,
  emissionAllocation: emissionAllocationUiSchema,
  additionalReportingData: additionalReportingDataUiSchema,
};

const resolveUiSchema = (uiSchema: any) => {
  if (typeof uiSchema !== "string") return uiSchema;
  return finalReviewSchemaMap[uiSchema];
};

const Form = withTheme(finalReviewTheme);

const FinalReviewForm: React.FC<Props> = ({
  version_id,
  taskListElements,
  data,
}) => {
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/sign-off`;
  const backUrl = `/reports/${version_id}/attachments`;

  const submitHandler = async () => {
    router.push(saveAndContinueUrl);
  };

  return (
    <MultiStepWrapperWithTaskList
      steps={multiStepHeaderSteps}
      initialStep={4}
      onSubmit={submitHandler}
      taskListElements={taskListElements}
      cancelUrl="#"
      backUrl={backUrl}
      continueUrl={saveAndContinueUrl}
      noFormSave={() => {}}
    >
      {data.map((form, idx) => (
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
      ))}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
