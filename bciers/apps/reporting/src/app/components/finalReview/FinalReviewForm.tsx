"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { uiSchemaMap } from "../activities/uiSchemas/schemaMaps";
import FinalReviewStringField from "./formCustomization/FinalReviewStringField";
import { nonAttributableEmissionUiSchema } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
  data: { schema: RJSFSchema; uiSchema: any; data: any }[];
}

// D
const finalReviewSchemaMap: { [key: string]: any } = {
  ...uiSchemaMap,
  nonAttributableEmissions: nonAttributableEmissionUiSchema,
  productionData: productionDataUiSchema,
};

const resolveUiSchema = (uiSchema: any) => {
  if (typeof uiSchema !== "string") return uiSchema;
  return finalReviewSchemaMap[uiSchema];
};

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
        <FormBase
          key={idx}
          schema={form.schema}
          formData={form.data}
          fields={{
            StringField: FinalReviewStringField,
          }}
          uiSchema={{
            ...resolveUiSchema(form.uiSchema),
            "ui:submitButtonOptions": { norender: true },
          }}
          readonly={true}
        />
      ))}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
