"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { getUiSchema } from "../activities/uiSchemas/schemaMaps";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
  data: { schema: RJSFSchema; uiSchema: any; data: any }[];
}

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
      {data.map((d, idx) => (
        <FormBase
          key={idx}
          schema={d.schema}
          formData={d.data}
          uiSchema={{
            ...(typeof d.uiSchema === "string"
              ? getUiSchema(d.uiSchema)
              : d.uiSchema),
            "ui:submitButtonOptions": { norender: true },
          }}
          readonly={true}
        />
      ))}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
