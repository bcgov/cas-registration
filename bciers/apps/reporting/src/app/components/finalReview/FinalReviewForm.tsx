"use client";

import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import { ReviewData } from "./reviewDataFactory/factory";
import { useState } from "react";
import FinalReviewFormRenderer from "@reporting/src/app/components/finalReview/formCustomization/FinalReviewFormRenderer";

interface Props extends HasReportVersion {
  taskListElements: TaskListElement[];
  data: ReviewData[];
  needsVerification: boolean;
}

const FinalReviewForm: React.FC<Props> = ({
  version_id,
  taskListElements,
  data,
  needsVerification,
}) => {
  const router = useRouter();
  const verificationUrl = `/reports/${version_id}/verification`;
  const attachmentUrl = `/reports/${version_id}/attachments`;
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
        if (form.items) {
          return (
            <details
              key={idx}
              className="border-2 border-t-0 border-b-0 border-[#38598A] p-2 my-2 w-full"
            >
              <summary className="cursor-pointer font-bold text-[#38598A] text-2xl py-2 border-2 border-t-0 border-b-0 border-[#38598A]">
                {form.schema.title}
              </summary>
              {form.items.map((item: any, index: number) =>
                FinalReviewFormRenderer({ idx: index, form: item, data }),
              )}
            </details>
          );
        }

        return FinalReviewFormRenderer({ idx, form, data });
      })}
    </MultiStepWrapperWithTaskList>
  );
};

export default FinalReviewForm;
