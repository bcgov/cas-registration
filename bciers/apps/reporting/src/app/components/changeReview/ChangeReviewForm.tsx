"use client";
import React, { useState } from "react";
import { actionHandler } from "@bciers/actions";
import { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { ReviewChanges } from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { useRouter } from "next/navigation";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";
import ReasonForChangeForm from "@reporting/src/app/components/changeReview/templates/ReasonForChange";

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
  const [reasonForChange, setReasonForChange] = useState(
    initialFormData.reason_for_change || "",
  );

  const handleSubmit = async (): Promise<void> => {
    setIsRedirecting(true);

    const payload = {
      ...formData,
      reason_for_change: reasonForChange,
    };

    const endpoint = `reporting/report-version/${versionId}`;
    const method = "POST";

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setErrors([response.error]);
      setIsRedirecting(false);
      return; // <--- just return void instead of false
    }

    setErrors(undefined);
    router.push(navigationInformation.continueUrl);
    // don't return true
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
      <ReasonForChangeForm
        reasonForChange={reasonForChange}
        onReasonChange={(val) => {
          setReasonForChange(val);
          setFormData({ ...formData, reason_for_change: val });
        }}
        onSubmit={handleSubmit}
      />
    </MultiStepWrapperWithTaskList>
  );
}
