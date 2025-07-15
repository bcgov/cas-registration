"use client";
import React, { useState } from "react";
import {
  changeReviewSchema,
  changeReviewUiSchema,
} from "@reporting/src/data/jsonSchema/changeReview/changeReview";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import ReviewChanges from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { FormBase } from "@bciers/components/form";
import { useRouter } from "next/navigation";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";

interface ChangeReviewProps {
  versionId: number;
  initialFormData: any;
  navigationInformation: NavigationInformation;
  changes: ChangeItem[];
}

export default function ChangeReviewForm({
  versionId,
  initialFormData,
  navigationInformation,
  changes,
}: ChangeReviewProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<string[]>();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsRedirecting(true);
    const endpoint = `reporting/report-version/${versionId}`;
    const method = "POST";
    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(formData),
    });
    if (response?.error) {
      setErrors([response.error]);
      setIsRedirecting(false);
      return false;
    }

    setErrors(undefined);
    // Redirect to continue URL after successful submission
    router.push(navigationInformation.continueUrl);
    return true;
  };

  return (
    <MultiStepWrapperWithTaskList
      initialStep={navigationInformation.headerStepIndex}
      steps={navigationInformation.headerSteps}
      taskListElements={navigationInformation.taskList}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      errors={errors}
      onSubmit={handleSubmit}
      isRedirecting={isRedirecting}
      noSaveButton={true}
    >
      <ReviewChanges changes={changes} />
      <FormBase
        schema={changeReviewSchema}
        className="flex flex-col flex-grow mt-10"
        uiSchema={changeReviewUiSchema}
        onChange={(data: any) => {
          setFormData(data.formData);
        }}
        formData={formData}
        omitExtraData={true}
      />
    </MultiStepWrapperWithTaskList>
  );
}
