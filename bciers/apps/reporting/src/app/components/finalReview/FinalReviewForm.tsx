"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
}

const FinalReviewForm: React.FC<Props> = ({ version_id, taskListElements }) => {
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
      Placeholder for Final Review
      <br />
      Version ID: {version_id}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
