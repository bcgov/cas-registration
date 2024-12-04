"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { useRouter } from "next/navigation";
import {
  ActivePage,
  getSignOffAndSubmitSteps,
} from "@reporting/src/app/components/taskList/5_signOffSubmit";

interface Props {
  version_id: number;
}

const FinalReviewForm: React.FC<Props> = ({
  version_id,
}: {
  version_id: number;
}) => {
  const taskListElements = getSignOffAndSubmitSteps(
    version_id,
    ActivePage.FinalReview,
  );
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/sign-off`;

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
    >
      Placeholder for Final Review
      <br />
      Version ID: {version_id}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
