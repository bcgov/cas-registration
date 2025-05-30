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
      {data.length === 0 ? (
        <div className="form-heading-label w-full">
          <label className="inline-block">Final Review</label>
          <p>
            The system is unable to display a large amount of facility reports.
            This issue will be fixed in a future version of the system. To
            review your facility reports, please return to report information.
          </p>
        </div>
      ) : (
        <FinalReviewForms data={data} />
      )}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
