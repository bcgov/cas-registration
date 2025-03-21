"use client";

import { useState } from "react";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";
import { ReviewData } from "./reviewDataFactory/factory";
import { NavigationInformation } from "../taskList/types";
import FinalReviewForms from "@reporting/src/app/components/finalReview/formCustomization/FinalReviewForms";

interface Props {
  navigationInformation: NavigationInformation;
  data: ReviewData[];
}

const FinalReviewForm: React.FC<Props> = ({ navigationInformation, data }) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const submitHandler = async () => {
    setIsRedirecting(true);
    router.push(navigationInformation.continueUrl);
  };

  return (
    <MultiStepWrapperWithTaskList
      steps={navigationInformation.headerSteps}
      initialStep={navigationInformation.headerStepIndex}
      onSubmit={submitHandler}
      isRedirecting={isRedirecting}
      taskListElements={navigationInformation.taskList}
      cancelUrl="#"
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      noFormSave={() => {}}
      submittingButtonText="Continue"
      noSaveButton
    >
      <FinalReviewForms data={data} />
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
